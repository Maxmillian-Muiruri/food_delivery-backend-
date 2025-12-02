#!/bin/bash
# Simplified driver assignment test - uses existing users

set -e

HOST="http://localhost:3000"
API_V1="${HOST}/api/v1"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Simplified Driver Assignment Test ===${NC}\n"

# Step 1: Get existing customer and driver tokens
echo -e "${BLUE}Step 1: Login as customer${NC}"
CUSTOMER_LOGIN=$(curl -s -X POST "${API_V1}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "Test123!"
  }')

CUSTOMER_TOKEN=$(echo $CUSTOMER_LOGIN | jq -r '.access_token' 2>/dev/null)
CUSTOMER_ID=$(echo $CUSTOMER_LOGIN | jq -r '.user.id' 2>/dev/null)

if [ "$CUSTOMER_TOKEN" = "null" ] || [ -z "$CUSTOMER_TOKEN" ]; then
  echo -e "${RED}Failed to login as customer${NC}"
  echo "$CUSTOMER_LOGIN"
  exit 1
fi

echo -e "${GREEN}✓ Customer logged in (ID: $CUSTOMER_ID)${NC}"
echo "Token: ${CUSTOMER_TOKEN:0:20}...\n"

# Step 2: Get driver token
echo -e "${BLUE}Step 2: Login as driver${NC}"
DRIVER_LOGIN=$(curl -s -X POST "${API_V1}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver@test.com",
    "password": "Test123!"
  }')

DRIVER_TOKEN=$(echo $DRIVER_LOGIN | jq -r '.access_token' 2>/dev/null)
DRIVER_ID=$(echo $DRIVER_LOGIN | jq -r '.user.id' 2>/dev/null)

if [ "$DRIVER_TOKEN" = "null" ] || [ -z "$DRIVER_TOKEN" ]; then
  echo -e "${RED}Failed to login as driver${NC}"
  echo "$DRIVER_LOGIN"
  exit 1
fi

echo -e "${GREEN}✓ Driver logged in (ID: $DRIVER_ID)${NC}"
echo "Token: ${DRIVER_TOKEN:0:20}...\n"

# Step 3: Create or get driver profile
echo -e "${BLUE}Step 3: Check/Create driver profile${NC}"
DRIVER_PROFILE=$(curl -s -X GET "${API_V1}/drivers/profile" \
  -H "Authorization: Bearer $DRIVER_TOKEN")

DRIVER_PROFILE_ID=$(echo $DRIVER_PROFILE | jq -r '.id' 2>/dev/null)

if [ "$DRIVER_PROFILE_ID" = "null" ] || [ -z "$DRIVER_PROFILE_ID" ]; then
  echo -e "${BLUE}Creating driver profile...${NC}"
  DRIVER_CREATE=$(curl -s -X POST "${API_V1}/drivers/register" \
    -H "Authorization: Bearer $DRIVER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "licensePlate": "DRV001",
      "vehicleType": "car"
    }')
  
  DRIVER_PROFILE_ID=$(echo $DRIVER_CREATE | jq -r '.id' 2>/dev/null)
  
  if [ "$DRIVER_PROFILE_ID" = "null" ] || [ -z "$DRIVER_PROFILE_ID" ]; then
    echo -e "${RED}Failed to create driver profile${NC}"
    echo "$DRIVER_CREATE"
    exit 1
  fi
fi

echo -e "${GREEN}✓ Driver profile exists (ID: $DRIVER_PROFILE_ID)${NC}\n"

# Step 4: Set driver availability and location
echo -e "${BLUE}Step 4: Set driver availability and location${NC}"
AVAILABILITY=$(curl -s -X PATCH "${API_V1}/drivers/${DRIVER_PROFILE_ID}/availability" \
  -H "Authorization: Bearer $DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"availability_status": "available"}')

echo -e "${GREEN}✓ Driver availability updated${NC}"

# Update location to near restaurant (40.7128, -74.0060 = NYC)
LOCATION=$(curl -s -X PATCH "${API_V1}/drivers/${DRIVER_PROFILE_ID}/location" \
  -H "Authorization: Bearer $DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060
  }')

echo -e "${GREEN}✓ Driver location updated (40.7128, -74.0060)${NC}\n"

# Step 5: Get a restaurant and menu item
echo -e "${BLUE}Step 5: Get restaurant and menu items${NC}"
RESTAURANTS=$(curl -s -X GET "${API_V1}/restaurants?limit=1" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")

REST_ID=$(echo $RESTAURANTS | jq -r '.[0].id' 2>/dev/null)

if [ "$REST_ID" = "null" ] || [ -z "$REST_ID" ]; then
  echo -e "${RED}No restaurants found in database${NC}"
  echo "$RESTAURANTS"
  exit 1
fi

echo -e "${GREEN}✓ Found restaurant (ID: $REST_ID)${NC}"

# Get menu items
MENU_ITEMS=$(curl -s -X GET "${API_V1}/menu-items?restaurant_id=${REST_ID}&limit=1" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")

MENU_ITEM_ID=$(echo $MENU_ITEMS | jq -r '.[0].id' 2>/dev/null)

if [ "$MENU_ITEM_ID" = "null" ] || [ -z "$MENU_ITEM_ID" ]; then
  echo -e "${RED}No menu items found for restaurant${NC}"
  echo "$MENU_ITEMS"
  exit 1
fi

echo -e "${GREEN}✓ Found menu item (ID: $MENU_ITEM_ID)${NC}\n"

# Step 6: Create order
echo -e "${BLUE}Step 6: Create order with auto-assignment${NC}"
ORDER=$(curl -s -X POST "${API_V1}/orders" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"restaurant_id\": $REST_ID,
    \"items\": [
      {
        \"menu_item_id\": $MENU_ITEM_ID,
        \"quantity\": 1,
        \"special_instructions\": \"No onions\"
      }
    ],
    \"delivery_address\": \"123 Main St, NYC, NY 10001\"
  }")
echo -e "${BLUE}Step 6: Create order with auto-assignment${NC}"
# Ensure there is a delivery address for the customer (create one if needed)
ADDRESS_LIST=$(curl -s -X GET "${API_V1}/addresses" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")
ADDRESS_ID=$(echo $ADDRESS_LIST | jq -r '.[0].id' 2>/dev/null)
if [ -z "$ADDRESS_ID" ] || [ "$ADDRESS_ID" = "null" ]; then
  ADDRESS_CREATE=$(curl -s -X POST "${API_V1}/addresses" \
    -H "Authorization: Bearer $CUSTOMER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"label":"Home","street_address":"456 Customer St","city":"Test City","state":"Test State","postal_code":"00000","country":"Testland","latitude":40.7129,"longitude":-74.0061}')
  ADDRESS_ID=$(echo $ADDRESS_CREATE | jq -r '.id' 2>/dev/null)
fi

ORDER=$(curl -s -X POST "${API_V1}/orders" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\n    \"restaurant_id\": $REST_ID,\n    \"address_id\": $ADDRESS_ID,\n    \"items\": [\n      {\n        \"menu_item_id\": $MENU_ITEM_ID,\n        \"quantity\": 1,\n        \"special_instructions\": \"No onions\"\n      }\n    ],\n    \"delivery_type\": \"now\",\n    \"payment_method\": \"cash\"\n  }")

ORDER_ID=$(echo $ORDER | jq -r '.id' 2>/dev/null)
ASSIGNED_DRIVER=$(echo $ORDER | jq -r '.driver_id' 2>/dev/null)

if [ "$ORDER_ID" = "null" ] || [ -z "$ORDER_ID" ]; then
  echo -e "${RED}Failed to create order${NC}"
  echo "$ORDER"
  exit 1
fi

echo -e "${GREEN}✓ Order created (ID: $ORDER_ID)${NC}"

if [ "$ASSIGNED_DRIVER" != "null" ] && [ -n "$ASSIGNED_DRIVER" ]; then
  echo -e "${GREEN}✓ Driver AUTO-ASSIGNED (Driver ID: $ASSIGNED_DRIVER)${NC}\n"
else
  echo -e "${BLUE}⚠ No driver auto-assigned (may need manual assignment)${NC}\n"
fi

# Step 7: Verify order
echo -e "${BLUE}Step 7: Verify order details${NC}"
ORDER_DETAILS=$(curl -s -X GET "${API_V1}/orders/${ORDER_ID}" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")

ORDER_STATUS=$(echo $ORDER_DETAILS | jq -r '.status' 2>/dev/null)
FINAL_DRIVER=$(echo $ORDER_DETAILS | jq -r '.driver_id' 2>/dev/null)

echo -e "${GREEN}✓ Order Status: $ORDER_STATUS${NC}"
echo -e "${GREEN}✓ Assigned Driver: $FINAL_DRIVER${NC}\n"

echo -e "${GREEN}=== Test Complete ===${NC}"
echo "Order ID: $ORDER_ID"
echo "Driver ID: $FINAL_DRIVER"
echo "Status: $ORDER_STATUS"
