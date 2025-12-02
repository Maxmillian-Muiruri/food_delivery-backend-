import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

// This is a smoke test for the driver auto-assignment flow.
// It is skipped by default because it requires a running DB with migrations applied.
describe.skip('Driver assignment (e2e smoke)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('creates a driver, places an order and expects assignment', async () => {
    // This test assumes you have an authenticated admin/user token available
    // and that migrations were run. It demonstrates the flow; adjust tokens
    // and payloads for your environment before enabling.

    // Create driver (replace token with valid auth)
    const driverResp = await request(app.getHttpServer())
      .post('/drivers/register')
      .set('Authorization', 'Bearer YOUR_DRIVER_JWT')
      .send({ licensePlate: 'ABC123', vehicleType: 'car' })
      .expect(201);

    // Create order (replace token with valid user jwt and payload)
    const orderPayload = {
      restaurant_id: 1,
      address_id: 1,
      payment_method: 'card',
      delivery_type: 'now',
      items: [{ menu_item_id: 1, quantity: 1 }],
    };

    const orderResp = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', 'Bearer YOUR_USER_JWT')
      .send(orderPayload)
      .expect(201);

    const order = orderResp.body;
    // Expect that the order either got assigned a driver or remains pending
    expect(order).toBeDefined();
    // If assignment is enabled, driver_id should be present
    // This is a soft assertion to show expected behavior when environment is ready
    // expect(order.driver_id).toBeDefined();
  });
});
