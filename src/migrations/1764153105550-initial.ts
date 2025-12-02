import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1764153105550 implements MigrationInterface {
  name = 'Initial1764153105550';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "store" ("store_id" int NOT NULL IDENTITY(1,1), "owner_id" int NOT NULL, "name" varchar(255) NOT NULL, "description" varchar(255) NOT NULL, "contact_info" varchar(255) NOT NULL, "image_url" varchar(255), "rating" decimal(3,2) NOT NULL CONSTRAINT "DF_7f8053a08d9b306d33cd5a92d39" DEFAULT 0, "total_reviews" int NOT NULL CONSTRAINT "DF_71447167b826a60209d4b873cd7" DEFAULT 0, "store_code" varchar(50) NOT NULL, "delivery_fee" int NOT NULL CONSTRAINT "DF_da436e732144656383b329b9829" DEFAULT 0, "is_active" bit NOT NULL CONSTRAINT "DF_972b85ff8596b3627f838aa1972" DEFAULT 1, "is_verified" bit NOT NULL CONSTRAINT "DF_f26c3863817be0589ddcbe2c86e" DEFAULT 0, "account_number" varchar(50), "created_at" timestamp NOT NULL CONSTRAINT "DF_776aaf868cdb9c168372a2bb1b0" DEFAULT getdate(), "updated_at" timestamp NOT NULL CONSTRAINT "DF_ce61796e8a8564da8605e8bac19" DEFAULT getdate(), "address_id" int, CONSTRAINT "UQ_8ce7c0371b6fca43a17f523ce44" UNIQUE ("owner_id"), CONSTRAINT "UQ_eaf3d0b9edcf9fe6bc0cdf61f69" UNIQUE ("store_code"), CONSTRAINT "PK_94d7b0f600366ceb5c960069687" PRIMARY KEY ("store_id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "REL_f3eb3afc763da3076e80e2459d" ON "store" ("address_id") WHERE "address_id" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "addresses" ("id" int NOT NULL IDENTITY(1,1), "userId" int NOT NULL, "label" varchar(255) NOT NULL, "street_address" varchar(500) NOT NULL, "street" varchar(255) NOT NULL, "city" varchar(100), "state" varchar(100), "postal_code" varchar(20), "zip_code" varchar(20) NOT NULL, "country" varchar(100), "latitude" decimal(10,8), "longitude" decimal(11,8), "type_col" varchar(20) NOT NULL CONSTRAINT "DF_f570e6977ca3d16e0b94bab0121" DEFAULT 'other', "is_default" bit NOT NULL CONSTRAINT "DF_e502583a70446a7c7090bce20a9" DEFAULT 0, "created_at" datetime2 NOT NULL CONSTRAINT "DF_8813e791fe4c6cc9de77c950c70" DEFAULT getdate(), "updated_at" datetime2 NOT NULL CONSTRAINT "DF_f695ee88c4fefac775eb871aea2" DEFAULT getdate(), CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "restaurants" ("id" int NOT NULL IDENTITY(1,1), "owner_id" int NOT NULL, "name" nvarchar(255) NOT NULL, "description" text NOT NULL, "logo_url" text NOT NULL, "logo_public_id" text, "banner_url" text, "banner_public_id" text, "cuisine_type" ntext, "address" nvarchar(255) NOT NULL, "city" nvarchar(100) NOT NULL, "state" nvarchar(100) NOT NULL, "latitude" decimal(10,7) NOT NULL, "longitude" decimal(10,7) NOT NULL, "phone_number" nvarchar(50), "email" nvarchar(255), "opening_hours" ntext, "rating_average" decimal(3,2) NOT NULL CONSTRAINT "DF_a270078df334131358947860d11" DEFAULT 0, "total_ratings" int NOT NULL CONSTRAINT "DF_4c85e67c44b156233d7278626ef" DEFAULT 0, "delivery_fee" decimal(10,2) NOT NULL CONSTRAINT "DF_74388cfb044f6f594706fb0a10b" DEFAULT 0, "minimum_order_amount" decimal(10,2) NOT NULL CONSTRAINT "DF_be9d9d5ff740d7873641be0fdaf" DEFAULT 0, "estimated_delivery_time" int NOT NULL CONSTRAINT "DF_2ef592b3f58a44fbc3d5b63165d" DEFAULT 30, "is_active" bit NOT NULL CONSTRAINT "DF_40616c71cdbeb3dfab24c87814c" DEFAULT 1, "is_featured" bit NOT NULL CONSTRAINT "DF_c953273019586b3d52ffefe72f2" DEFAULT 0, "is_verified" bit NOT NULL CONSTRAINT "DF_2f0ff297d9a6d1771d509f20c6e" DEFAULT 0, "restaurant_code" varchar(50), "created_at" datetime2 NOT NULL CONSTRAINT "DF_f9154ff0ac83ad0918625e00351" DEFAULT getdate(), "updated_at" datetime2 NOT NULL CONSTRAINT "DF_16161a8ab9ac5e10f7fe3c3bd9f" DEFAULT getdate(), "address_id" int, CONSTRAINT "UQ_3a7709e9dab12cb1a90f6cb3388" UNIQUE ("restaurant_code"), CONSTRAINT "PK_e2133a72eb1cc8f588f7b503e68" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "menu_items" ("id" int NOT NULL IDENTITY(1,1), "restaurant_id" int NOT NULL, "name" nvarchar(255) NOT NULL, "description" text NOT NULL, "price" decimal(10,2) NOT NULL, "category" nvarchar(100), "image_url" text, "image_public_id" text, "is_available" bit NOT NULL CONSTRAINT "DF_d6c170a25492610a34a2b59e5c5" DEFAULT 1, "allergens" ntext, "dietary_tags" ntext, "ingredients" text, "preparation_time" int NOT NULL CONSTRAINT "DF_bbb47be77ccffe870ab535be91a" DEFAULT 0, "created_at" datetime2 NOT NULL CONSTRAINT "DF_f04fc347426c9454f62be901b13" DEFAULT getdate(), "updated_at" datetime2 NOT NULL CONSTRAINT "DF_09ac5796fc90f45957df88e11ac" DEFAULT getdate(), CONSTRAINT "PK_57e6188f929e5dc6919168620c8" PRIMARY KEY ("id"))`,
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
      `CREATE TABLE "users" ("id" int NOT NULL IDENTITY(1,1), "email" nvarchar(255) NOT NULL, "password_hash" nvarchar(255), "full_name" nvarchar(255) NOT NULL, "phone_number" nvarchar(50), "profile_picture_url" text, "profile_picture_public_id" text, "role" varchar(50), "dietary_preferences" ntext, "allergens" ntext, "social_provider" varchar(50), "social_provider_id" nvarchar(255), "is_active" bit NOT NULL CONSTRAINT "DF_20c7aea6112bef71528210f631d" DEFAULT 1, "created_at" datetime2 NOT NULL CONSTRAINT "DF_c9b5b525a96ddc2c5647d7f7fa5" DEFAULT getdate(), "updated_at" datetime2 NOT NULL CONSTRAINT "DF_6d596d799f9cb9dac6f7bf7c23c" DEFAULT getdate(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
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
      `CREATE TABLE "reviews" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_231ae565c273ee700b283f15c1d" DEFAULT NEWSEQUENTIALID(), "userId" int NOT NULL, "targetId" int NOT NULL, "targetType" varchar(20) NOT NULL, "orderId" int, "rating" int NOT NULL, "comment" text, "status" varchar(20) NOT NULL CONSTRAINT "DF_7b06c23cf52ca8aea0dcaf0ee22" DEFAULT 'pending', "isVerified" bit NOT NULL CONSTRAINT "DF_7f2c06bc1060f79063cc584d8cd" DEFAULT 0, "helpfulVotes" int NOT NULL CONSTRAINT "DF_aaf81d3e2c2b03c8e25d231f1cd" DEFAULT 0, "totalVotes" int NOT NULL CONSTRAINT "DF_95e905572378ee780f18ad8825d" DEFAULT 0, "metadata" ntext, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_4952a5c91db543e1bf2b91a3ebf" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_9db5e0928b45dddc1b3ce6f2bf3" DEFAULT getdate(), CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_97a0f9b77a1d46c89c387daeb6" ON "reviews" ("userId", "targetId", "targetType") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fd70c899fdf150578b5950a7c3" ON "reviews" ("targetId", "targetType") `,
    );
    await queryRunner.query(
      `CREATE TABLE "promo_codes" ("id" int NOT NULL IDENTITY(1,1), "code" nvarchar(50) NOT NULL, "description" text NOT NULL, "discount_type" varchar(50) NOT NULL, "discount_value" decimal(10,2) NOT NULL, "minimum_order_amount" decimal(10,2), "maximum_discount_amount" decimal(10,2), "valid_from" datetime NOT NULL, "valid_until" datetime NOT NULL, "usage_limit" int NOT NULL CONSTRAINT "DF_a3706202cfaed9579a92453bb0e" DEFAULT 1, "usage_count" int NOT NULL CONSTRAINT "DF_5d1314b24f77885fc757223730e" DEFAULT 0, "is_first_order_only" bit NOT NULL CONSTRAINT "DF_e94bf72015d58a5c80b0187bcee" DEFAULT 0, "is_active" bit NOT NULL CONSTRAINT "DF_163e7e3450596ca4b1ccab39fb7" DEFAULT 1, "created_at" datetime2 NOT NULL CONSTRAINT "DF_66736495e5d0e5376a1dc5b5712" DEFAULT getdate(), "updated_at" datetime2 NOT NULL CONSTRAINT "DF_036db2a5bc146022e848fc78fc0" DEFAULT getdate(), CONSTRAINT "UQ_2f096c406a9d9d5b8ce204190c3" UNIQUE ("code"), CONSTRAINT "PK_c7b4f01710fda5afa056a2b4a35" PRIMARY KEY ("id"))`,
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
      `CREATE TABLE "drivers" ("id" int NOT NULL IDENTITY(1,1), "user_id" int NOT NULL, "license_plate" varchar(50), "vehicle_type" varchar(50), "availability_status" varchar(20) NOT NULL CONSTRAINT "DF_3a155d1585b990c91d3665b3d25" DEFAULT 'offline', "current_latitude" decimal(10,7), "current_longitude" decimal(11,7), "average_rating" decimal(3,2) NOT NULL CONSTRAINT "DF_3e0afee5d2bc01d9c9caccc5409" DEFAULT 0, "total_deliveries" int NOT NULL CONSTRAINT "DF_ced02ec6ad6c58706df39f1f112" DEFAULT 0, "total_earnings" decimal(12,2) NOT NULL CONSTRAINT "DF_76ed61234e6acfa23e4a43a129e" DEFAULT 0, "created_at" datetime2 NOT NULL CONSTRAINT "DF_5d9efd10f78eb2d77ea057b1d79" DEFAULT getdate(), "updated_at" datetime2 NOT NULL CONSTRAINT "DF_bf704f2dae554d3916ef9eb5e3d" DEFAULT getdate(), CONSTRAINT "UQ_b44653e1a519728b47dd986b310" UNIQUE ("license_plate"), CONSTRAINT "PK_92ab3fb69e566d3eb0cae896047" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "driver_documents" ("id" int NOT NULL IDENTITY(1,1), "driver_id" int NOT NULL, "document_type" varchar(50) NOT NULL, "document_url" varchar(500) NOT NULL, "cloudinary_public_id" varchar(255), "status" varchar(20) NOT NULL CONSTRAINT "DF_5c8a5b95d5bfcf8413ff62b690a" DEFAULT 'pending', "rejection_reason" varchar(255), "created_at" datetime2 NOT NULL CONSTRAINT "DF_5ac84bf2bc914d85ec09a08a4b9" DEFAULT getdate(), "updated_at" datetime2 NOT NULL CONSTRAINT "DF_e846322a1db8a07249bee0557a8" DEFAULT getdate(), CONSTRAINT "PK_31c28b4e8f55a5d411597d45ab2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "carts" ("id" int NOT NULL IDENTITY(1,1), "user_id" int NOT NULL, "restaurant_id" int NOT NULL, "menu_item_id" int NOT NULL, "quantity" int NOT NULL CONSTRAINT "DF_87eb1b53e9eb8fec33113f04057" DEFAULT 1, "special_instructions" text, "price_at_purchase" decimal(10,2) NOT NULL, "created_at" datetime2 NOT NULL CONSTRAINT "DF_b4e5008b7138148ed27942e9dc0" DEFAULT getdate(), "updated_at" datetime2 NOT NULL CONSTRAINT "DF_4a79119b1e8057d671754a90cea" DEFAULT getdate(), CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "store" ADD CONSTRAINT "FK_8ce7c0371b6fca43a17f523ce44" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "store" ADD CONSTRAINT "FK_f3eb3afc763da3076e80e2459dd" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "FK_95c93a584de49f0b0e13f753630" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD CONSTRAINT "FK_efe4eead3adf44a4649a3353efc" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD CONSTRAINT "FK_35a195ed4ea3859440488d12bae" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_items" ADD CONSTRAINT "FK_8d1ee4780bf64ae94cbf3e53705" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE "menu_items" DROP CONSTRAINT "FK_8d1ee4780bf64ae94cbf3e53705"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP CONSTRAINT "FK_35a195ed4ea3859440488d12bae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP CONSTRAINT "FK_efe4eead3adf44a4649a3353efc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "FK_95c93a584de49f0b0e13f753630"`,
    );
    await queryRunner.query(
      `ALTER TABLE "store" DROP CONSTRAINT "FK_f3eb3afc763da3076e80e2459dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "store" DROP CONSTRAINT "FK_8ce7c0371b6fca43a17f523ce44"`,
    );
    await queryRunner.query(`DROP TABLE "carts"`);
    await queryRunner.query(`DROP TABLE "driver_documents"`);
    await queryRunner.query(`DROP TABLE "drivers"`);
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
    await queryRunner.query(`DROP TABLE "promo_codes"`);
    await queryRunner.query(
      `DROP INDEX "IDX_fd70c899fdf150578b5950a7c3" ON "reviews"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_97a0f9b77a1d46c89c387daeb6" ON "reviews"`,
    );
    await queryRunner.query(`DROP TABLE "reviews"`);
    await queryRunner.query(`DROP TABLE "review_photos"`);
    await queryRunner.query(
      `DROP INDEX "IDX_dff9fe2e660dfcac9542bc06c1" ON "review_votes"`,
    );
    await queryRunner.query(`DROP TABLE "review_votes"`);
    await queryRunner.query(`DROP TABLE "transfer"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "payment"`);
    await queryRunner.query(`DROP TABLE "order_tracking"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "menu_items"`);
    await queryRunner.query(`DROP TABLE "restaurants"`);
    await queryRunner.query(`DROP TABLE "addresses"`);
    await queryRunner.query(
      `DROP INDEX "REL_f3eb3afc763da3076e80e2459d" ON "store"`,
    );
    await queryRunner.query(`DROP TABLE "store"`);
  }
}
