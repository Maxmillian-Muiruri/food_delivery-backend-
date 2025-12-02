import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewFieldsMigration1764152737457 implements MigrationInterface {
  name = 'AddNewFieldsMigration1764152737457';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "drivers" DROP CONSTRAINT "FK__drivers__user_id__531856C7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" DROP CONSTRAINT "FK__driver_do__drive__58D1301D"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_targetId_targetType" ON "reviews"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_userId_targetId_targetType" ON "reviews"`,
    );
    await queryRunner.query(
      `CREATE TABLE "store" ("store_id" int NOT NULL IDENTITY(1,1), "owner_id" int NOT NULL, "name" varchar(255) NOT NULL, "description" varchar(255) NOT NULL, "contact_info" varchar(255) NOT NULL, "image_url" varchar(255), "rating" decimal(3,2) NOT NULL CONSTRAINT "DF_7f8053a08d9b306d33cd5a92d39" DEFAULT 0, "total_reviews" int NOT NULL CONSTRAINT "DF_71447167b826a60209d4b873cd7" DEFAULT 0, "store_code" varchar(50) NOT NULL, "delivery_fee" int NOT NULL CONSTRAINT "DF_da436e732144656383b329b9829" DEFAULT 0, "is_active" bit NOT NULL CONSTRAINT "DF_972b85ff8596b3627f838aa1972" DEFAULT 1, "is_verified" bit NOT NULL CONSTRAINT "DF_f26c3863817be0589ddcbe2c86e" DEFAULT 0, "account_number" varchar(50), "created_at" timestamp NOT NULL CONSTRAINT "DF_776aaf868cdb9c168372a2bb1b0" DEFAULT getdate(), "updated_at" timestamp NOT NULL CONSTRAINT "DF_ce61796e8a8564da8605e8bac19" DEFAULT getdate(), "address_id" int, CONSTRAINT "UQ_8ce7c0371b6fca43a17f523ce44" UNIQUE ("owner_id"), CONSTRAINT "UQ_eaf3d0b9edcf9fe6bc0cdf61f69" UNIQUE ("store_code"), CONSTRAINT "PK_94d7b0f600366ceb5c960069687" PRIMARY KEY ("store_id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "REL_f3eb3afc763da3076e80e2459d" ON "store" ("address_id") WHERE "address_id" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_items" ("id" int NOT NULL IDENTITY(1,1), "order_id" int NOT NULL, "menu_item_id" int NOT NULL, "quantity" int NOT NULL, "price_at_purchase" decimal(10,2) NOT NULL, "special_instructions" text, "created_at" datetime2 NOT NULL CONSTRAINT "DF_d27b2515c37cefee4ed975e3fb0" DEFAULT getdate(), CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_tracking" ("id" int NOT NULL IDENTITY(1,1), "order_id" int NOT NULL, "status" varchar(50) NOT NULL, "message" text, "latitude" decimal(10,7), "longitude" decimal(10,7), "created_at" datetime2 NOT NULL CONSTRAINT "DF_85b72e681c9190bbce2501d2cc3" DEFAULT getdate(), CONSTRAINT "PK_9a32ecbe7d925bd403cae3e76e6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "payment" ("payment_id" int NOT NULL IDENTITY(1,1), "payment_number" varchar(20) NOT NULL, "order_id" int NOT NULL, "email" varchar(255) NOT NULL, "authorization_url" nvarchar(255), "user_id" int NOT NULL, "amount" decimal(10,2) NOT NULL, "currency" varchar(3) NOT NULL CONSTRAINT "DF_41f2c5480b079efda823e4794ea" DEFAULT 'KES', "payment_method" varchar(50) NOT NULL, "gateway" varchar(50) NOT NULL, "payment_reference" varchar(255) NOT NULL, "status" varchar(50) NOT NULL CONSTRAINT "DF_3af0086da18f32ac05a52e56390" DEFAULT 'pending', "transaction_id" varchar(255), "gateway_reference" varchar(255), "gateway_response" nvarchar(MAX), "failure_reason" text, "refunded_amount" decimal(10,2) NOT NULL CONSTRAINT "DF_f177fe7e03e05c86d16a13a9b58" DEFAULT 0, "processed_at" timestamp CONSTRAINT "DF_6aed5ca7585138bdcf002bfaf13" DEFAULT getdate(), "failed_at" timestamp, "delivery_initiated" bit NOT NULL CONSTRAINT "DF_8aab03ccd0f3682582fd995cc2f" DEFAULT 0, "delivery_reference" int, "delivery_error" text, "updated_at" timestamp NOT NULL CONSTRAINT "DF_6765c894a5ccf625b7b0a4ac9e3" DEFAULT getdate(), CONSTRAINT "UQ_28f823091ff91a736d72a206e07" UNIQUE ("payment_number"), CONSTRAINT "UQ_54fc428ca06ce52fd478d8706d8" UNIQUE ("payment_reference"), CONSTRAINT "PK_9fff60ac6ac1844ea4e0cfba67a" PRIMARY KEY ("payment_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" int NOT NULL IDENTITY(1,1), "order_number" nvarchar(255) NOT NULL, "user_id" int NOT NULL, "restaurant_id" int NOT NULL, "store_id" int, "driver_id" int, "address_id" int NOT NULL, "status" varchar(50) NOT NULL, "subtotal" decimal(10,2) NOT NULL, "delivery_fee" decimal(10,2) NOT NULL CONSTRAINT "DF_a52aee16e03e2334ff8bb3e6649" DEFAULT 0, "tax" decimal(10,2) NOT NULL CONSTRAINT "DF_7e6ec9129e51cf83734790748b0" DEFAULT 0, "discount_amount" decimal(10,2) NOT NULL CONSTRAINT "DF_0e8edc84edc39e4ad764abe0748" DEFAULT 0, "tip_amount" decimal(10,2) NOT NULL CONSTRAINT "DF_d68813f5602a2cab6974ad7971a" DEFAULT 0, "total_amount" decimal(10,2) NOT NULL, "promo_code_id" int, "payment_method" varchar(50) NOT NULL, "payment_status" varchar(50) NOT NULL CONSTRAINT "DF_892cef7cd3962597f0a1c006795" DEFAULT 'pending', "delivery_type" varchar(50) NOT NULL CONSTRAINT "DF_5f256f30907c36713ab99c91b1d" DEFAULT 'now', "scheduled_delivery_time" datetime, "delivery_instructions" text, "estimated_delivery_time" int NOT NULL CONSTRAINT "DF_56a7c3aa4166db6469c5cf9e1b0" DEFAULT 30, "created_at" datetime2 NOT NULL CONSTRAINT "DF_c884e321f927d5b86aac7c8f9ef" DEFAULT getdate(), "updated_at" datetime2 NOT NULL CONSTRAINT "DF_44eaa1eacc7a091d5d3e2a6c828" DEFAULT getdate(), "delivered_at" datetime, CONSTRAINT "UQ_75eba1c6b1a66b09f2a97e6927b" UNIQUE ("order_number"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "transfer" ("transfer_id" int NOT NULL IDENTITY(1,1), "amount" int NOT NULL, "currency" nvarchar(255) NOT NULL, "recipient_type" nvarchar(255) NOT NULL, "recipient_id" nvarchar(255) NOT NULL, "recipient_name" nvarchar(255) NOT NULL, "recipient_account" nvarchar(255) NOT NULL, "recipient_bank_code" nvarchar(255) NOT NULL, "reference" nvarchar(255), "status" nvarchar(255), "reason" nvarchar(255), "order_id" int, "delivery_id" int, "created_at" datetime2 NOT NULL CONSTRAINT "DF_086e57d995900e69b54046e257b" DEFAULT getdate(), CONSTRAINT "PK_7aa3769048ff14716eb5e0939e1" PRIMARY KEY ("transfer_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "review_votes" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_687569add3c5a70950438fa0cee" DEFAULT NEWSEQUENTIALID(), "reviewId" uniqueidentifier NOT NULL, "userId" int NOT NULL, "voteType" varchar(20) NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_e8a2f11de9a33e73d3e097a5ad5" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_97e9f24ea50f91fd5d3a7ac5f02" DEFAULT getdate(), CONSTRAINT "PK_687569add3c5a70950438fa0cee" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_dff9fe2e660dfcac9542bc06c1" ON "review_votes" ("reviewId", "userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "review_photos" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_ea3cd0fbc3e3cc9c147fd373911" DEFAULT NEWSEQUENTIALID(), "reviewId" uniqueidentifier NOT NULL, "imageUrl" varchar(500) NOT NULL, "cloudinaryPublicId" varchar(255), "caption" varchar(255), "sortOrder" int NOT NULL CONSTRAINT "DF_e8c8da7c4487137f891e0822df1" DEFAULT 0, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_ff7150c4d5d629ab69fe65f4ed7" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_124dbbac3aa733bc9648ba6520b" DEFAULT getdate(), CONSTRAINT "PK_ea3cd0fbc3e3cc9c147fd373911" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_promo_usage" ("id" int NOT NULL IDENTITY(1,1), "user_id" int NOT NULL, "promo_code_id" int NOT NULL, "order_id" int NOT NULL, "discount_amount" decimal(10,2) NOT NULL, "order_total" decimal(10,2) NOT NULL, "created_at" datetime2 NOT NULL CONSTRAINT "DF_fc92e585dbb9db5cd36c2e651dd" DEFAULT getdate(), CONSTRAINT "PK_fa384f9e5dc8c473379e3914c0e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" int NOT NULL IDENTITY(1,1), "user_id" int NOT NULL, "type" varchar(50) NOT NULL, "title" varchar(255) NOT NULL, "message" text NOT NULL, "data" nvarchar(MAX), "channel" varchar(20) NOT NULL CONSTRAINT "DF_0fc9fe9a0d500d8275ee4bbc4cb" DEFAULT 'in_app', "is_read" bit NOT NULL CONSTRAINT "DF_f12148ce379462ebbb4d06cc136" DEFAULT 0, "created_at" datetime2 NOT NULL CONSTRAINT "DF_77ee7b06d6f802000c0846f3a56" DEFAULT getdate(), "updated_at" datetime2 NOT NULL CONSTRAINT "DF_bc1d74459bf51659c6f4e4c429a" DEFAULT getdate(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9a8a82462cab47c73d25f49261" ON "notifications" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_310667f935698fcd8cb319113a" ON "notifications" ("user_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_af08fad7c04bb85403970afdc1" ON "notifications" ("user_id", "is_read") `,
    );
    await queryRunner.query(
      `CREATE TABLE "favorites" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_890818d27523748dd36a4d1bdc8" DEFAULT NEWSEQUENTIALID(), "created_at" datetime2 NOT NULL CONSTRAINT "DF_939c23a5e656ea58619c04d3239" DEFAULT getdate(), "updated_at" datetime2 NOT NULL CONSTRAINT "DF_ce9ad26f851f25f0aa958c640e8" DEFAULT getdate(), "user_id" int, "restaurant_id" int, "menu_item_id" int, CONSTRAINT "UQ_9c6e5fb39a816d13ce3b0123817" UNIQUE ("user_id", "restaurant_id", "menu_item_id"), CONSTRAINT "PK_890818d27523748dd36a4d1bdc8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "carts" ("id" int NOT NULL IDENTITY(1,1), "user_id" int NOT NULL, "restaurant_id" int NOT NULL, "menu_item_id" int NOT NULL, "quantity" int NOT NULL CONSTRAINT "DF_87eb1b53e9eb8fec33113f04057" DEFAULT 1, "special_instructions" text, "price_at_purchase" decimal(10,2) NOT NULL, "created_at" datetime2 NOT NULL CONSTRAINT "DF_b4e5008b7138148ed27942e9dc0" DEFAULT getdate(), "updated_at" datetime2 NOT NULL CONSTRAINT "DF_4a79119b1e8057d671754a90cea" DEFAULT getdate(), CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "label"`);
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "label" varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "DF_b0c34a095b54580b84ea4e21f2e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ALTER COLUMN "city" varchar(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ALTER COLUMN "state" varchar(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ALTER COLUMN "latitude" decimal(10,8)`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ALTER COLUMN "longitude" decimal(11,8)`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "DF_8813e791fe4c6cc9de77c950c70"`,
    );
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "created_at" datetime2 NOT NULL CONSTRAINT "DF_8813e791fe4c6cc9de77c950c70" DEFAULT getdate()`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "DF_f695ee88c4fefac775eb871aea2"`,
    );
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "updated_at" datetime2 NOT NULL CONSTRAINT "DF_f695ee88c4fefac775eb871aea2" DEFAULT getdate()`,
    );
    await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "name" nvarchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "description" text NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "logo_url"`);
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "logo_url" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP COLUMN "logo_public_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "logo_public_id" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP COLUMN "banner_url"`,
    );
    await queryRunner.query(`ALTER TABLE "restaurants" ADD "banner_url" text`);
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP COLUMN "banner_public_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "banner_public_id" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP COLUMN "cuisine_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "cuisine_type" ntext`,
    );
    await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "address"`);
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "address" nvarchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "city"`);
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "city" nvarchar(100) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "state"`);
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "state" nvarchar(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP COLUMN "phone_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "phone_number" nvarchar(50)`,
    );
    await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "email"`);
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "email" nvarchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP COLUMN "opening_hours"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "opening_hours" ntext`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD CONSTRAINT "UQ_3a7709e9dab12cb1a90f6cb3388" UNIQUE ("restaurant_code")`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP CONSTRAINT "DF_f9154ff0ac83ad0918625e00351"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "created_at" datetime2 NOT NULL CONSTRAINT "DF_f9154ff0ac83ad0918625e00351" DEFAULT getdate()`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP CONSTRAINT "DF_16161a8ab9ac5e10f7fe3c3bd9f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "updated_at" datetime2 NOT NULL CONSTRAINT "DF_16161a8ab9ac5e10f7fe3c3bd9f" DEFAULT getdate()`,
    );
    await queryRunner.query(`ALTER TABLE "menu_items" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "menu_items" ADD "name" nvarchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" ADD "description" text NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "menu_items" DROP COLUMN "category"`);
    await queryRunner.query(
      `ALTER TABLE "menu_items" ADD "category" nvarchar(100)`,
    );
    await queryRunner.query(`ALTER TABLE "menu_items" DROP COLUMN "image_url"`);
    await queryRunner.query(`ALTER TABLE "menu_items" ADD "image_url" text`);
    await queryRunner.query(
      `ALTER TABLE "menu_items" DROP COLUMN "image_public_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" ADD "image_public_id" text`,
    );
    await queryRunner.query(`ALTER TABLE "menu_items" DROP COLUMN "allergens"`);
    await queryRunner.query(`ALTER TABLE "menu_items" ADD "allergens" ntext`);
    await queryRunner.query(
      `ALTER TABLE "menu_items" DROP COLUMN "dietary_tags"`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" ADD "dietary_tags" ntext`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" DROP COLUMN "ingredients"`,
    );
    await queryRunner.query(`ALTER TABLE "menu_items" ADD "ingredients" text`);
    await queryRunner.query(
      `ALTER TABLE "menu_items" DROP CONSTRAINT "DF_f04fc347426c9454f62be901b13"`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" ADD "created_at" datetime2 NOT NULL CONSTRAINT "DF_f04fc347426c9454f62be901b13" DEFAULT getdate()`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" DROP CONSTRAINT "DF_09ac5796fc90f45957df88e11ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" ADD "updated_at" datetime2 NOT NULL CONSTRAINT "DF_09ac5796fc90f45957df88e11ac" DEFAULT getdate()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "email" nvarchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_hash"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "password_hash" nvarchar(255)`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "full_name"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "full_name" nvarchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone_number"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "phone_number" nvarchar(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "profile_picture_url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "profile_picture_url" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "profile_picture_public_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "profile_picture_public_id" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "DF_ace513fa30d485cfd25c11a9e4a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "dietary_preferences"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "dietary_preferences" ntext`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "allergens"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "allergens" ntext`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "DF_c9b5b525a96ddc2c5647d7f7fa5"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "created_at" datetime2 NOT NULL CONSTRAINT "DF_c9b5b525a96ddc2c5647d7f7fa5" DEFAULT getdate()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "DF_6d596d799f9cb9dac6f7bf7c23c"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "updated_at" datetime2 NOT NULL CONSTRAINT "DF_6d596d799f9cb9dac6f7bf7c23c" DEFAULT getdate()`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "PK_231ae565c273ee700b283f15c1d"`,
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "id" uniqueidentifier NOT NULL CONSTRAINT "DF_231ae565c273ee700b283f15c1d" DEFAULT NEWSEQUENTIALID()`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "reviews" ADD "userId" int NOT NULL`);
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "targetId"`);
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "targetId" int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "orderId"`);
    await queryRunner.query(`ALTER TABLE "reviews" ADD "orderId" int`);
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "comment"`);
    await queryRunner.query(`ALTER TABLE "reviews" ADD "comment" text`);
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "metadata"`);
    await queryRunner.query(`ALTER TABLE "reviews" ADD "metadata" ntext`);
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "DF_4952a5c91db543e1bf2b91a3ebf"`,
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "createdAt" datetime2 NOT NULL CONSTRAINT "DF_4952a5c91db543e1bf2b91a3ebf" DEFAULT getdate()`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "DF_9db5e0928b45dddc1b3ce6f2bf3"`,
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_9db5e0928b45dddc1b3ce6f2bf3" DEFAULT getdate()`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_codes" DROP CONSTRAINT "UQ_2f096c406a9d9d5b8ce204190c3"`,
    );
    await queryRunner.query(`ALTER TABLE "promo_codes" DROP COLUMN "code"`);
    await queryRunner.query(
      `ALTER TABLE "promo_codes" ADD "code" nvarchar(50) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_codes" ADD CONSTRAINT "UQ_2f096c406a9d9d5b8ce204190c3" UNIQUE ("code")`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_codes" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_codes" ADD "description" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_codes" DROP CONSTRAINT "DF_66736495e5d0e5376a1dc5b5712"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_codes" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_codes" ADD "created_at" datetime2 NOT NULL CONSTRAINT "DF_66736495e5d0e5376a1dc5b5712" DEFAULT getdate()`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_codes" DROP CONSTRAINT "DF_036db2a5bc146022e848fc78fc0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_codes" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_codes" ADD "updated_at" datetime2 NOT NULL CONSTRAINT "DF_036db2a5bc146022e848fc78fc0" DEFAULT getdate()`,
    );
    await queryRunner.query(
      `ALTER TABLE "drivers" ADD CONSTRAINT "UQ_b44653e1a519728b47dd986b310" UNIQUE ("license_plate")`,
    );
    await queryRunner.query(
      `ALTER TABLE "drivers" ALTER COLUMN "current_longitude" decimal(11,7)`,
    );
    await queryRunner.query(
      `ALTER TABLE "drivers" ALTER COLUMN "total_earnings" decimal(12,2) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "drivers" DROP CONSTRAINT "DF_5d9efd10f78eb2d77ea057b1d79"`,
    );
    await queryRunner.query(`ALTER TABLE "drivers" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "drivers" ADD "created_at" datetime2 NOT NULL CONSTRAINT "DF_5d9efd10f78eb2d77ea057b1d79" DEFAULT getdate()`,
    );
    await queryRunner.query(
      `ALTER TABLE "drivers" DROP CONSTRAINT "DF_bf704f2dae554d3916ef9eb5e3d"`,
    );
    await queryRunner.query(`ALTER TABLE "drivers" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "drivers" ADD "updated_at" datetime2 NOT NULL CONSTRAINT "DF_bf704f2dae554d3916ef9eb5e3d" DEFAULT getdate()`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" DROP COLUMN "document_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" ADD "document_type" varchar(50) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" DROP COLUMN "document_url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" ADD "document_url" varchar(500) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" DROP COLUMN "cloudinary_public_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" ADD "cloudinary_public_id" varchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" DROP CONSTRAINT "DF_5c8a5b95d5bfcf8413ff62b690a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" DROP COLUMN "status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" ADD "status" varchar(20) NOT NULL CONSTRAINT "DF_5c8a5b95d5bfcf8413ff62b690a" DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" DROP COLUMN "rejection_reason"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" ADD "rejection_reason" varchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" DROP CONSTRAINT "DF_5ac84bf2bc914d85ec09a08a4b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" ADD "created_at" datetime2 NOT NULL CONSTRAINT "DF_5ac84bf2bc914d85ec09a08a4b9" DEFAULT getdate()`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" DROP CONSTRAINT "DF_e846322a1db8a07249bee0557a8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" ADD "updated_at" datetime2 NOT NULL CONSTRAINT "DF_e846322a1db8a07249bee0557a8" DEFAULT getdate()`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_97a0f9b77a1d46c89c387daeb6" ON "reviews" ("userId", "targetId", "targetType") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fd70c899fdf150578b5950a7c3" ON "reviews" ("targetId", "targetType") `,
    );
    await queryRunner.query(
      `ALTER TABLE "store" ADD CONSTRAINT "FK_8ce7c0371b6fca43a17f523ce44" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "store" ADD CONSTRAINT "FK_f3eb3afc763da3076e80e2459dd" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD CONSTRAINT "FK_35a195ed4ea3859440488d12bae" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_e462517174f561ece2916701c0a" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_tracking" ADD CONSTRAINT "FK_c1e2051fba9bdbb70641cd90ea4" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_f5221735ace059250daac9d9803" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_c66c60a17b56ec882fcd8ec770b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_85fdda5fcce2f397ef8f117a2c6" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_d39c53244703b8534307adcd073" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_votes" ADD CONSTRAINT "FK_35fdcea131e84362d9eb6573ce8" FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_votes" ADD CONSTRAINT "FK_f34aa40b63e1adedf8623254045" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_photos" ADD CONSTRAINT "FK_73428832f4d647dc22aefe3109e" FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_4a73980338b57f2c9178d8aaeb9" FOREIGN KEY ("targetId") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_53a68dc905777554b7f702791fa" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_promo_usage" ADD CONSTRAINT "FK_338d0aa3d3bd482cf06ab620a67" FOREIGN KEY ("promo_code_id") REFERENCES "promo_codes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_promo_usage" ADD CONSTRAINT "FK_c0d8fcf4e3421a872cf3fe662db" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorites" ADD CONSTRAINT "FK_35a6b05ee3b624d0de01ee50593" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorites" ADD CONSTRAINT "FK_61a7e9427fce239c7ff6f3e7186" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorites" ADD CONSTRAINT "FK_8d1c3a3eb63e89effa1a5779dea" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "drivers" ADD CONSTRAINT "FK_8e224f1b8f05ace7cfc7c76d03b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" ADD CONSTRAINT "FK_dc156b37dfa0fcda0ef1974bab8" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" ADD CONSTRAINT "FK_2ec1c94a977b940d85a4f498aea" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" ADD CONSTRAINT "FK_ad50548131c585e38d765bde166" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" ADD CONSTRAINT "FK_fa4d35ef535d5606940a2f9c6af" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "carts" DROP CONSTRAINT "FK_fa4d35ef535d5606940a2f9c6af"`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" DROP CONSTRAINT "FK_ad50548131c585e38d765bde166"`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" DROP CONSTRAINT "FK_2ec1c94a977b940d85a4f498aea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" DROP CONSTRAINT "FK_dc156b37dfa0fcda0ef1974bab8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "drivers" DROP CONSTRAINT "FK_8e224f1b8f05ace7cfc7c76d03b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorites" DROP CONSTRAINT "FK_8d1c3a3eb63e89effa1a5779dea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorites" DROP CONSTRAINT "FK_61a7e9427fce239c7ff6f3e7186"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorites" DROP CONSTRAINT "FK_35a6b05ee3b624d0de01ee50593"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_promo_usage" DROP CONSTRAINT "FK_c0d8fcf4e3421a872cf3fe662db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_promo_usage" DROP CONSTRAINT "FK_338d0aa3d3bd482cf06ab620a67"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_53a68dc905777554b7f702791fa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_4a73980338b57f2c9178d8aaeb9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_photos" DROP CONSTRAINT "FK_73428832f4d647dc22aefe3109e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_votes" DROP CONSTRAINT "FK_f34aa40b63e1adedf8623254045"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_votes" DROP CONSTRAINT "FK_35fdcea131e84362d9eb6573ce8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_d39c53244703b8534307adcd073"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_85fdda5fcce2f397ef8f117a2c6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_a922b820eeef29ac1c6800e826a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" DROP CONSTRAINT "FK_c66c60a17b56ec882fcd8ec770b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" DROP CONSTRAINT "FK_f5221735ace059250daac9d9803"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_tracking" DROP CONSTRAINT "FK_c1e2051fba9bdbb70641cd90ea4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_e462517174f561ece2916701c0a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_145532db85752b29c57d2b7b1f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP CONSTRAINT "FK_35a195ed4ea3859440488d12bae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "store" DROP CONSTRAINT "FK_f3eb3afc763da3076e80e2459dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "store" DROP CONSTRAINT "FK_8ce7c0371b6fca43a17f523ce44"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_fd70c899fdf150578b5950a7c3" ON "reviews"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_97a0f9b77a1d46c89c387daeb6" ON "reviews"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" DROP CONSTRAINT "DF_e846322a1db8a07249bee0557a8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" ADD "updated_at" datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" ADD CONSTRAINT "DF_e846322a1db8a07249bee0557a8" DEFAULT getdate() FOR "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" DROP CONSTRAINT "DF_5ac84bf2bc914d85ec09a08a4b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" ADD "created_at" datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" ADD CONSTRAINT "DF_5ac84bf2bc914d85ec09a08a4b9" DEFAULT getdate() FOR "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" DROP COLUMN "rejection_reason"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" ADD "rejection_reason" nvarchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" DROP CONSTRAINT "DF_5c8a5b95d5bfcf8413ff62b690a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" DROP COLUMN "status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" ADD "status" varchar(50) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" ADD CONSTRAINT "DF_5c8a5b95d5bfcf8413ff62b690a" DEFAULT 'pending' FOR "status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" DROP COLUMN "cloudinary_public_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" ADD "cloudinary_public_id" nvarchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" DROP COLUMN "document_url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" ADD "document_url" nvarchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" DROP COLUMN "document_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" ADD "document_type" varchar(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "drivers" DROP CONSTRAINT "DF_bf704f2dae554d3916ef9eb5e3d"`,
    );
    await queryRunner.query(`ALTER TABLE "drivers" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "drivers" ADD "updated_at" datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "drivers" ADD CONSTRAINT "DF_bf704f2dae554d3916ef9eb5e3d" DEFAULT getdate() FOR "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "drivers" DROP CONSTRAINT "DF_5d9efd10f78eb2d77ea057b1d79"`,
    );
    await queryRunner.query(`ALTER TABLE "drivers" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "drivers" ADD "created_at" datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "drivers" ADD CONSTRAINT "DF_5d9efd10f78eb2d77ea057b1d79" DEFAULT getdate() FOR "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "drivers" ALTER COLUMN "total_earnings" decimal(10,2) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "drivers" ALTER COLUMN "current_longitude" decimal(10,7)`,
    );
    await queryRunner.query(
      `ALTER TABLE "drivers" DROP CONSTRAINT "UQ_b44653e1a519728b47dd986b310"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_codes" DROP CONSTRAINT "DF_036db2a5bc146022e848fc78fc0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_codes" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_codes" ADD "updated_at" datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_codes" ADD CONSTRAINT "DF_036db2a5bc146022e848fc78fc0" DEFAULT getdate() FOR "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_codes" DROP CONSTRAINT "DF_66736495e5d0e5376a1dc5b5712"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_codes" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_codes" ADD "created_at" datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_codes" ADD CONSTRAINT "DF_66736495e5d0e5376a1dc5b5712" DEFAULT getdate() FOR "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_codes" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_codes" ADD "description" nvarchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_codes" DROP CONSTRAINT "UQ_2f096c406a9d9d5b8ce204190c3"`,
    );
    await queryRunner.query(`ALTER TABLE "promo_codes" DROP COLUMN "code"`);
    await queryRunner.query(
      `ALTER TABLE "promo_codes" ADD "code" varchar(50) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo_codes" ADD CONSTRAINT "UQ_2f096c406a9d9d5b8ce204190c3" UNIQUE ("code")`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "DF_9db5e0928b45dddc1b3ce6f2bf3"`,
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "updatedAt" datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "DF_9db5e0928b45dddc1b3ce6f2bf3" DEFAULT getdate() FOR "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "DF_4952a5c91db543e1bf2b91a3ebf"`,
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "createdAt" datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "DF_4952a5c91db543e1bf2b91a3ebf" DEFAULT getdate() FOR "createdAt"`,
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "metadata"`);
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "metadata" nvarchar(255)`,
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "comment"`);
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "comment" nvarchar(255)`,
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "orderId"`);
    await queryRunner.query(`ALTER TABLE "reviews" ADD "orderId" varchar(36)`);
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "targetId"`);
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "targetId" varchar(100) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "userId" varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "PK_231ae565c273ee700b283f15c1d"`,
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "id" varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "DF_6d596d799f9cb9dac6f7bf7c23c"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "updated_at" datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "DF_6d596d799f9cb9dac6f7bf7c23c" DEFAULT getdate() FOR "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "DF_c9b5b525a96ddc2c5647d7f7fa5"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "created_at" datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "DF_c9b5b525a96ddc2c5647d7f7fa5" DEFAULT getdate() FOR "created_at"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "allergens"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "allergens" nvarchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "dietary_preferences"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "dietary_preferences" nvarchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "DF_ace513fa30d485cfd25c11a9e4a" DEFAULT 'customer' FOR "role"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "profile_picture_public_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "profile_picture_public_id" nvarchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "profile_picture_url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "profile_picture_url" nvarchar(255)`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone_number"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "phone_number" varchar(50)`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "full_name"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "full_name" varchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_hash"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "password_hash" varchar(255)`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "email" varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" DROP CONSTRAINT "DF_09ac5796fc90f45957df88e11ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" ADD "updated_at" datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" ADD CONSTRAINT "DF_09ac5796fc90f45957df88e11ac" DEFAULT getdate() FOR "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" DROP CONSTRAINT "DF_f04fc347426c9454f62be901b13"`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" ADD "created_at" datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" ADD CONSTRAINT "DF_f04fc347426c9454f62be901b13" DEFAULT getdate() FOR "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" DROP COLUMN "ingredients"`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" ADD "ingredients" nvarchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" DROP COLUMN "dietary_tags"`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" ADD "dietary_tags" nvarchar(255)`,
    );
    await queryRunner.query(`ALTER TABLE "menu_items" DROP COLUMN "allergens"`);
    await queryRunner.query(
      `ALTER TABLE "menu_items" ADD "allergens" nvarchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" DROP COLUMN "image_public_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" ADD "image_public_id" nvarchar(255)`,
    );
    await queryRunner.query(`ALTER TABLE "menu_items" DROP COLUMN "image_url"`);
    await queryRunner.query(
      `ALTER TABLE "menu_items" ADD "image_url" nvarchar(255)`,
    );
    await queryRunner.query(`ALTER TABLE "menu_items" DROP COLUMN "category"`);
    await queryRunner.query(
      `ALTER TABLE "menu_items" ADD "category" varchar(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" ADD "description" nvarchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "menu_items" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "menu_items" ADD "name" varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP CONSTRAINT "DF_16161a8ab9ac5e10f7fe3c3bd9f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "updated_at" datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD CONSTRAINT "DF_16161a8ab9ac5e10f7fe3c3bd9f" DEFAULT getdate() FOR "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP CONSTRAINT "DF_f9154ff0ac83ad0918625e00351"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "created_at" datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD CONSTRAINT "DF_f9154ff0ac83ad0918625e00351" DEFAULT getdate() FOR "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP CONSTRAINT "UQ_3a7709e9dab12cb1a90f6cb3388"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP COLUMN "opening_hours"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "opening_hours" nvarchar(255)`,
    );
    await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "email"`);
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "email" varchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP COLUMN "phone_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "phone_number" varchar(50)`,
    );
    await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "state"`);
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "state" varchar(100) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "city"`);
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "city" varchar(100) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "address"`);
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "address" varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP COLUMN "cuisine_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "cuisine_type" nvarchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP COLUMN "banner_public_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "banner_public_id" nvarchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP COLUMN "banner_url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "banner_url" nvarchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP COLUMN "logo_public_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "logo_public_id" nvarchar(255)`,
    );
    await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "logo_url"`);
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "logo_url" nvarchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "description" nvarchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD "name" varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "DF_f695ee88c4fefac775eb871aea2"`,
    );
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "updated_at" datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "DF_f695ee88c4fefac775eb871aea2" DEFAULT getdate() FOR "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "DF_8813e791fe4c6cc9de77c950c70"`,
    );
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "created_at" datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "DF_8813e791fe4c6cc9de77c950c70" DEFAULT getdate() FOR "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ALTER COLUMN "longitude" decimal(10,7)`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ALTER COLUMN "latitude" decimal(10,7)`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ALTER COLUMN "state" varchar(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ALTER COLUMN "city" varchar(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "DF_b0c34a095b54580b84ea4e21f2e" DEFAULT '' FOR "street_address"`,
    );
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "label"`);
    await queryRunner.query(`ALTER TABLE "addresses" ADD "label" varchar(50)`);
    await queryRunner.query(`DROP TABLE "carts"`);
    await queryRunner.query(`DROP TABLE "favorites"`);
    await queryRunner.query(
      `DROP INDEX "IDX_af08fad7c04bb85403970afdc1" ON "notifications"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_310667f935698fcd8cb319113a" ON "notifications"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_9a8a82462cab47c73d25f49261" ON "notifications"`,
    );
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TABLE "user_promo_usage"`);
    await queryRunner.query(`DROP TABLE "review_photos"`);
    await queryRunner.query(
      `DROP INDEX "IDX_dff9fe2e660dfcac9542bc06c1" ON "review_votes"`,
    );
    await queryRunner.query(`DROP TABLE "review_votes"`);
    await queryRunner.query(`DROP TABLE "transfer"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "payment"`);
    await queryRunner.query(`DROP TABLE "order_tracking"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(
      `DROP INDEX "REL_f3eb3afc763da3076e80e2459d" ON "store"`,
    );
    await queryRunner.query(`DROP TABLE "store"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_userId_targetId_targetType" ON "reviews" ("userId", "targetId", "targetType") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_targetId_targetType" ON "reviews" ("targetId", "targetType") `,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_documents" ADD CONSTRAINT "FK__driver_do__drive__58D1301D" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "drivers" ADD CONSTRAINT "FK__drivers__user_id__531856C7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
