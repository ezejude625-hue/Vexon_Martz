import { NextResponse } from "next/server";
import { prisma, serialize } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateOrderNumber, applyCoupon } from "@/lib/utils";

export async function GET(req) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;
  try {
    const orders = await prisma.order.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          select: {
            productName: true,
            productImage: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
          },
        },
        address: true,
      },
    });
    return NextResponse.json({ success: true, data: serialize(orders) });
  } catch (err) {
    console.error("[GET /api/orders]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;
  try {
    const {
      coupon_code,
      payment_method = "stripe",
      delivery_name,
      delivery_email,
      delivery_phone,
      delivery_address,
      delivery_city,
      delivery_state,
      delivery_country,
      delivery_postal,
    } = await req.json();

    const cart = await prisma.cart.findUnique({
      where: { userId: user.userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                salePrice: true,
                thumbnailUrl: true,
                stock: true,
                productType: true,
              },
            },
          },
        },
      },
    });
    if (!cart || !cart.items.length)
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 },
      );

    const subtotal = cart.items.reduce(
      (sum, item) =>
        sum +
        parseFloat(item.product.salePrice || item.product.price) *
          item.quantity,
      0,
    );

    let discountAmount = 0,
      couponId = null;
    if (coupon_code) {
      const validCoupon = await prisma.coupon.findFirst({
        where: {
          code: coupon_code.toUpperCase(),
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      });
      if (
        validCoupon &&
        (validCoupon.usageLimit === null ||
          validCoupon.usedCount < validCoupon.usageLimit) &&
        subtotal >= parseFloat(validCoupon.minOrderAmount || 0)
      ) {
        const { discount } = applyCoupon(
          subtotal,
          validCoupon.discountType,
          parseFloat(validCoupon.discountValue),
          validCoupon.maxDiscount ? parseFloat(validCoupon.maxDiscount) : null,
        );
        discountAmount = discount;
        couponId = validCoupon.id;
      }
    }

    const taxAmount = (subtotal - discountAmount) * 0.075;
    const shippingAmount = subtotal >= 100 ? 0 : 9.99;
    const totalAmount = subtotal - discountAmount + taxAmount + shippingAmount;
    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      // Create an Address record for this delivery
      let addressId = null;
      if (delivery_address && delivery_city && delivery_country) {
        const addr = await tx.address.create({
          data: {
            userId: user.userId,
            label: "Order Delivery",
            fullName: delivery_name || "",
            phone: delivery_phone || null,
            street: delivery_address,
            city: delivery_city,
            state: delivery_state || null,
            country: delivery_country,
            postalCode: delivery_postal || null,
            isDefault: false,
          },
        });
        addressId = addr.id;
      }

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user.userId,
          couponId,
          addressId,
          subtotal,
          discountAmount,
          taxAmount,
          shippingAmount,
          totalAmount,
          status: "processing",
          paymentStatus: "paid",
          paymentMethod: payment_method,
          // Store delivery email in notes as JSON (not in Order schema)
          notes: delivery_email
            ? JSON.stringify({ deliveryEmail: delivery_email })
            : null,
        },
      });

      for (const item of cart.items) {
        const unitPrice = parseFloat(
          item.product.salePrice || item.product.price,
        );
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.product.id,
            productName: item.product.name,
            productImage: item.product.thumbnailUrl,
            quantity: item.quantity,
            unitPrice,
            totalPrice: unitPrice * item.quantity,
          },
        });
        if (item.product.stock !== -1) {
          await tx.product.update({
            where: { id: item.product.id },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      if (couponId)
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order placed",
        data: { order_number: order.orderNumber },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/orders]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
