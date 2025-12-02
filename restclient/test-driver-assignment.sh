#!/bin/bash
# Driver assignment testing script using curl
# This script tests the driver registration, location update, and order creation flow.

set -e

# Configuration
HOST="http://localhost:3000"
API_V1="${HOST}/api/v1"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Driver Assignment Testing Script ===${NC}\n"

# Step 1: Register a user (customer)
echo -e "${BLUE}Step 1: Register customer user${NC}"
CUSTOMER_RESPONSE=$(curl -s -X POST "${API_V1}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "Test123!",
    "full_name": "Test Customer",
    "phone_number": "1234567890"
  }')

CUSTOMER_TOKEN=$(echo $CUSTOMER_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
CUSTOMER_ID=$(echo $CUSTOMER_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$CUSTOMER_TOKEN" ]; then
  echo -e "${RED}Failed to register customer${NC}"
  echo "$CUSTOMER_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Customer registered (ID: $CUSTOMER_ID)${NC}"
echo "Token: ${CUSTOMER_TOKEN:0:20}...\n"

# Step 2: Register a driver
echo -e "${BLUE}Step 2: Register driver user${NC}"
DRIVER_RESPONSE=$(curl -s -X POST "${API_V1}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver@test.com",
    "password": "Test123!",
    "full_name": "Test Driver",
    "phone_number": "9876543210"
  }')

DRIVER_TOKEN=$(echo $DRIVER_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
DRIVER_USER_ID=$(echo $DRIVER_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$DRIVER_TOKEN" ]; then
  echo -e "${RED}Failed to register driver${NC}"
  echo "$DRIVER_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Driver registered (User ID: $DRIVER_USER_ID)${NC}"
echo "Token: ${DRIVER_TOKEN:0:20}...\n"

# Step 3: Register driver in drivers table
echo -e "${BLUE}Step 3: Register as driver (create driver profile)${NC}"
DRIVER_PROFILE=$(curl -s -X POST "${API_V1}/drivers/register" \
  -H "Authorization: Bearer $DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "licensePlate": "DRV001",
    "vehicleType": "car"
  }')

DRIVER_ID=$(echo $DRIVER_PROFILE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$DRIVER_ID" ]; then
  echo -e "${RED}Failed to create driver profile${NC}"
  echo "$DRIVER_PROFILE"
  exit 1
fi

echo -e "${GREEN}✓ Driver profile created (Driver ID: $DRIVER_ID)${NC}\n"

# Step 4: Update driver availability to "available"
echo -e "${BLUE}Step 4: Set driver availability to available${NC}"
AVAILABILITY_RESPONSE=$(curl -s -X PATCH "${API_V1}/drivers/me/availability" \
  -H "Authorization: Bearer $DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "availabilityStatus": "available"
  }')

echo -e "${GREEN}✓ Driver availability updated${NC}\n"

# Step 5: Update driver location (important for nearby search)
echo -e "${BLUE}Step 5: Update driver location${NC}"
LOCATION_RESPONSE=$(curl -s -X PATCH "${API_V1}/drivers/me/location" \
  -H "Authorization: Bearer $DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 49.420318,
    "longitude": 8.687872
  }')

echo -e "${GREEN}✓ Driver location set to (49.420318, 8.687872)${NC}\n"

# Step 6: Create or fetch a restaurant
echo -e "${BLUE}Step 6: Fetching restaurant list${NC}"
RESTAURANTS=$(curl -s -X GET "${API_V1}/restaurants" \
  -H "Content-Type: application/json")

RESTAURANT_ID=$(echo $RESTAURANTS | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$RESTAURANT_ID" ]; then
  echo -e "${RED}No restaurants found. Create one first via${NC}"
  echo "POST ${API_V1}/restaurants"
  exit 1
fi

echo -e "${GREEN}✓ Found restaurant (ID: $RESTAURANT_ID)${NC}\n"

# Step 7: Create or fetch menu item
echo -e "${BLUE}Step 7: Fetching menu items${NC}"
MENU_ITEMS=$(curl -s -X GET "${API_V1}/menu-items" \
  -H "Content-Type: application/json")

MENU_ITEM_ID=$(echo $MENU_ITEMS | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$MENU_ITEM_ID" ]; then
  echo -e "${RED}No menu items found. Create one first via${NC}"
  echo "POST ${API_V1}/menu-items"
  exit 1
fi

echo -e "${GREEN}✓ Found menu item (ID: $MENU_ITEM_ID)${NC}\n"

# Step 8: Create customer address
echo -e "${BLUE}Step 8: Creating customer address${NC}"
ADDRESS_RESPONSE=$(curl -s -X POST "${API_V1}/api/v1/addresses" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "street": "123 Test St",
    "city": "Test City",
    "state": "TS",
    "zip_code": "12345",
    "label": "home",
    "latitude": 49.420318,
    "longitude": 8.687872
  }')

ADDRESS_ID=$(echo $ADDRESS_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$ADDRESS_ID" ]; then
  echo -e "${YELLOW}Warning: Could not create address, trying to fetch existing${NC}"
  ADDRESSES=$(curl -s -X GET "${API_V1}/api/v1/addresses" \
    -H "Authorization: Bearer $CUSTOMER_TOKEN" \
    -H "Content-Type: application/json")
  ADDRESS_ID=$(echo $ADDRESSES | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  
  if [ -z "$ADDRESS_ID" ]; then
    echo -e "${RED}No addresses available${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}✓ Address created/found (ID: $ADDRESS_ID)${NC}\n"

# Step 9: Create order (should trigger driver assignment)
echo -e "${BLUE}Step 9: Creating order (triggers driver assignment)${NC}"
ORDER_RESPONSE=$(curl -s -X POST "${API_V1}/orders" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"restaurant_id\": $RESTAURANT_ID,
    \"address_id\": $ADDRESS_ID,
    \"payment_method\": \"card\",
    \"delivery_type\": \"now\",
    \"items\": [
      { \"menu_item_id\": $MENU_ITEM_ID, \"quantity\": 1 }
    ],
    \"delivery_instructions\": \"Leave at door\"
  }")

ORDER_ID=$(echo $ORDER_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
ASSIGNED_DRIVER=$(echo $ORDER_RESPONSE | grep -o '"driver_id":[0-9]*' | cut -d':' -f2)
ORDER_STATUS=$(echo $ORDER_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)

if [ -z "$ORDER_ID" ]; then
  echo -e "${RED}Failed to create order${NC}"
  echo "$ORDER_RESPONSE" | head -20
  exit 1
fi

echo -e "${GREEN}✓ Order created (ID: $ORDER_ID)${NC}"
echo "  Status: $ORDER_STATUS"
echo "  Assigned Driver ID: ${ASSIGNED_DRIVER:-'Not assigned'}\n"

# Step 10: Fetch order details to verify assignment and tracking
echo -e "${BLUE}Step 10: Fetching order details and tracking${NC}"
ORDER_DETAILS=$(curl -s -X GET "${API_V1}/orders/${ORDER_ID}" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json")

echo -e "${GREEN}✓ Order Details:${NC}"
echo "$ORDER_DETAILS" | grep -o '"driver_id":[0-9]*' || echo "  No driver assigned (Haversine fallback or no available drivers)"
echo "$ORDER_DETAILS" | grep -o '"status":"[^"]*'

# Summary
echo -e "\n${BLUE}=== Test Summary ===${NC}"
echo -e "Customer ID: ${GREEN}$CUSTOMER_ID${NC}"
echo -e "Driver ID: ${GREEN}$DRIVER_ID${NC}"
echo -e "Restaurant ID: ${GREEN}$RESTAURANT_ID${NC}"
echo -e "Order ID: ${GREEN}$ORDER_ID${NC}"
echo -e "Order Status: ${GREEN}${ORDER_STATUS}${NC}"
echo -e "Assigned Driver: ${GREEN}${ASSIGNED_DRIVER:-'Not assigned (best-effort)'}${NC}"
echo -e "\n${BLUE}Check server logs for ORS routing details.${NC}\n"
