
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  role: 'role',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  phone: 'phone',
  passwordHash: 'passwordHash',
  avatarUrl: 'avatarUrl',
  bio: 'bio',
  emailVerified: 'emailVerified',
  isActive: 'isActive',
  resetToken: 'resetToken',
  resetExpires: 'resetExpires',
  lastLogin: 'lastLogin',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AddressScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  label: 'label',
  fullName: 'fullName',
  phone: 'phone',
  street: 'street',
  city: 'city',
  state: 'state',
  country: 'country',
  postalCode: 'postalCode',
  isDefault: 'isDefault',
  createdAt: 'createdAt'
};

exports.Prisma.VendorScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  storeName: 'storeName',
  storeSlug: 'storeSlug',
  description: 'description',
  logoUrl: 'logoUrl',
  bannerUrl: 'bannerUrl',
  status: 'status',
  isVerified: 'isVerified',
  payoutMethod: 'payoutMethod',
  payoutDetails: 'payoutDetails',
  totalSales: 'totalSales',
  totalRevenue: 'totalRevenue',
  avgRating: 'avgRating',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CategoryScalarFieldEnum = {
  id: 'id',
  parentId: 'parentId',
  name: 'name',
  slug: 'slug',
  description: 'description',
  icon: 'icon',
  imageUrl: 'imageUrl',
  sortOrder: 'sortOrder',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.ProductScalarFieldEnum = {
  id: 'id',
  sellerId: 'sellerId',
  categoryId: 'categoryId',
  name: 'name',
  slug: 'slug',
  description: 'description',
  shortDesc: 'shortDesc',
  price: 'price',
  salePrice: 'salePrice',
  thumbnailUrl: 'thumbnailUrl',
  images: 'images',
  tags: 'tags',
  productType: 'productType',
  stock: 'stock',
  sku: 'sku',
  status: 'status',
  isFeatured: 'isFeatured',
  totalSales: 'totalSales',
  avgRating: 'avgRating',
  reviewCount: 'reviewCount',
  metaTitle: 'metaTitle',
  metaDesc: 'metaDesc',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductFileScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  fileName: 'fileName',
  fileUrl: 'fileUrl',
  fileSize: 'fileSize',
  fileType: 'fileType',
  version: 'version',
  createdAt: 'createdAt'
};

exports.Prisma.CouponScalarFieldEnum = {
  id: 'id',
  code: 'code',
  description: 'description',
  discountType: 'discountType',
  discountValue: 'discountValue',
  minOrderAmount: 'minOrderAmount',
  maxDiscount: 'maxDiscount',
  usageLimit: 'usageLimit',
  usedCount: 'usedCount',
  startsAt: 'startsAt',
  expiresAt: 'expiresAt',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  orderNumber: 'orderNumber',
  userId: 'userId',
  couponId: 'couponId',
  addressId: 'addressId',
  subtotal: 'subtotal',
  discountAmount: 'discountAmount',
  taxAmount: 'taxAmount',
  shippingAmount: 'shippingAmount',
  totalAmount: 'totalAmount',
  currency: 'currency',
  status: 'status',
  paymentStatus: 'paymentStatus',
  paymentMethod: 'paymentMethod',
  paymentRef: 'paymentRef',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderItemScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  productId: 'productId',
  productName: 'productName',
  productImage: 'productImage',
  quantity: 'quantity',
  unitPrice: 'unitPrice',
  totalPrice: 'totalPrice',
  createdAt: 'createdAt'
};

exports.Prisma.CartScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CartItemScalarFieldEnum = {
  id: 'id',
  cartId: 'cartId',
  productId: 'productId',
  quantity: 'quantity',
  addedAt: 'addedAt'
};

exports.Prisma.WishlistScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  productId: 'productId',
  addedAt: 'addedAt'
};

exports.Prisma.ReviewScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  userId: 'userId',
  orderId: 'orderId',
  rating: 'rating',
  title: 'title',
  body: 'body',
  isVerified: 'isVerified',
  isApproved: 'isApproved',
  createdAt: 'createdAt'
};

exports.Prisma.DownloadScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  productId: 'productId',
  downloadCount: 'downloadCount',
  lastDownloaded: 'lastDownloaded',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.SupportTicketScalarFieldEnum = {
  id: 'id',
  subject: 'subject',
  userId: 'userId',
  orderId: 'orderId',
  category: 'category',
  status: 'status',
  priority: 'priority',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TicketMessageScalarFieldEnum = {
  id: 'id',
  ticketId: 'ticketId',
  userId: 'userId',
  body: 'body',
  isStaff: 'isStaff',
  createdAt: 'createdAt'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  fromUserId: 'fromUserId',
  toUserId: 'toUserId',
  subject: 'subject',
  body: 'body',
  isRead: 'isRead',
  createdAt: 'createdAt'
};

exports.Prisma.ExpenseScalarFieldEnum = {
  id: 'id',
  category: 'category',
  description: 'description',
  amount: 'amount',
  currency: 'currency',
  date: 'date',
  receiptUrl: 'receiptUrl',
  createdById: 'createdById',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  body: 'body',
  type: 'type',
  link: 'link',
  isRead: 'isRead',
  createdAt: 'createdAt'
};

exports.Prisma.SettingScalarFieldEnum = {
  id: 'id',
  key: 'key',
  value: 'value',
  group: 'group',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.Role = exports.$Enums.Role = {
  admin: 'admin',
  customer: 'customer',
  vendor: 'vendor',
  support: 'support'
};

exports.VendorStatus = exports.$Enums.VendorStatus = {
  pending: 'pending',
  active: 'active',
  suspended: 'suspended'
};

exports.ProductType = exports.$Enums.ProductType = {
  physical: 'physical',
  digital: 'digital'
};

exports.ProductStatus = exports.$Enums.ProductStatus = {
  draft: 'draft',
  active: 'active',
  paused: 'paused',
  archived: 'archived'
};

exports.DiscountType = exports.$Enums.DiscountType = {
  percentage: 'percentage',
  fixed: 'fixed'
};

exports.OrderStatus = exports.$Enums.OrderStatus = {
  pending: 'pending',
  processing: 'processing',
  shipped: 'shipped',
  delivered: 'delivered',
  cancelled: 'cancelled',
  refunded: 'refunded'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  unpaid: 'unpaid',
  paid: 'paid',
  refunded: 'refunded',
  partially_refunded: 'partially_refunded'
};

exports.PaymentMethod = exports.$Enums.PaymentMethod = {
  stripe: 'stripe',
  paypal: 'paypal',
  cod: 'cod',
  bank_transfer: 'bank_transfer'
};

exports.TicketStatus = exports.$Enums.TicketStatus = {
  open: 'open',
  in_progress: 'in_progress',
  resolved: 'resolved',
  closed: 'closed'
};

exports.TicketPriority = exports.$Enums.TicketPriority = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  urgent: 'urgent'
};

exports.ExpenseCategory = exports.$Enums.ExpenseCategory = {
  infrastructure: 'infrastructure',
  marketing: 'marketing',
  salaries: 'salaries',
  operations: 'operations',
  other: 'other'
};

exports.Prisma.ModelName = {
  User: 'User',
  Address: 'Address',
  Vendor: 'Vendor',
  Category: 'Category',
  Product: 'Product',
  ProductFile: 'ProductFile',
  Coupon: 'Coupon',
  Order: 'Order',
  OrderItem: 'OrderItem',
  Cart: 'Cart',
  CartItem: 'CartItem',
  Wishlist: 'Wishlist',
  Review: 'Review',
  Download: 'Download',
  SupportTicket: 'SupportTicket',
  TicketMessage: 'TicketMessage',
  Message: 'Message',
  Expense: 'Expense',
  Notification: 'Notification',
  Setting: 'Setting'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
