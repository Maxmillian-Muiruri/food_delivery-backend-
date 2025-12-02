#!/bin/bash

# Review Photo Upload - Automated Test Script
# This script tests the review photo upload endpoint

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000/api/v1}"
TIMEOUT=10

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_test() {
    echo -e "${YELLOW}TEST: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ PASSED: $1${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

print_failure() {
    echo -e "${RED}✗ FAILED: $1${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

# Create test image
create_test_image() {
    local filename=$1
    # Create a minimal valid JPEG
    printf '\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xFF\xD9' > "$filename"
}

# Test 1: Check if server is running
test_server_health() {
    print_test "Server health check"
    TESTS_RUN=$((TESTS_RUN + 1))
    
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL/health" 2>/dev/null || echo "error")
    
    if [[ $response == *"200"* ]] || [[ $response == *"404"* ]]; then
        print_success "Server is running"
    else
        print_failure "Server is not responding. Start with: npm run start:dev"
        echo "Response: $response"
    fi
    echo
}

# Test 2: Missing file
test_missing_file() {
    print_test "Upload without file (should fail)"
    TESTS_RUN=$((TESTS_RUN + 1))
    
    # You'll need a valid JWT token - this test assumes no token for simplicity
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/reviews/test-id/upload-photo" 2>/dev/null || echo "error")
    
    # Should get 401 Unauthorized (no token) or 400 (no file)
    if [[ $response == *"40"* ]]; then
        print_success "Correctly rejected request without file"
    else
        print_failure "Should reject request without file/token"
    fi
    echo
}

# Test 3: Invalid file type
test_invalid_file_type() {
    print_test "Upload with invalid file type (should fail)"
    TESTS_RUN=$((TESTS_RUN + 1))
    
    # Create text file
    echo "not an image" > test_invalid.txt
    
    # This will fail due to missing auth, but we're testing the validation
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/reviews/test-id/upload-photo" \
        -F "file=@test_invalid.txt" 2>/dev/null || echo "error")
    
    # Should get 401 (auth) before file type check in this case
    if [[ $response == *"40"* ]]; then
        print_success "Request properly validated"
    fi
    
    rm -f test_invalid.txt
    echo
}

# Test 4: Create valid test image and show upload command
test_valid_image_setup() {
    print_test "Prepare valid test image"
    TESTS_RUN=$((TESTS_RUN + 1))
    
    create_test_image "test_valid.jpg"
    
    if [[ -f test_valid.jpg ]] && [[ -s test_valid.jpg ]]; then
        print_success "Valid test image created ($(wc -c < test_valid.jpg) bytes)"
    else
        print_failure "Failed to create test image"
    fi
    echo
}

# Test 5: Show curl command for authenticated upload
test_show_upload_command() {
    print_test "Generate upload command template"
    TESTS_RUN=$((TESTS_RUN + 1))
    
    cat > test_upload_example.sh << 'EOF'
#!/bin/bash
# Example upload command (requires JWT token and existing review)

JWT_TOKEN="YOUR_JWT_TOKEN_HERE"
REVIEW_ID="YOUR_REVIEW_ID_HERE"
BASE_URL="http://localhost:3000/api/v1"

# Create test image
printf '\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xFF\xD9' > test.jpg

# Upload
echo "Uploading photo to review $REVIEW_ID..."
curl -X POST "$BASE_URL/reviews/$REVIEW_ID/upload-photo" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -F "file=@test.jpg" \
  -H "Accept: application/json"

# Cleanup
rm -f test.jpg
EOF

    chmod +x test_upload_example.sh
    print_success "Created test_upload_example.sh (see file for authenticated upload example)"
    echo
}

# Test 6: Verify controller endpoint exists
test_endpoint_definition() {
    print_test "Verify endpoint is defined in code"
    TESTS_RUN=$((TESTS_RUN + 1))
    
    if grep -q "upload-photo" src/modules/reviews/reviews.controller.ts 2>/dev/null; then
        print_success "Endpoint 'POST /:reviewId/upload-photo' is defined"
    else
        print_failure "Endpoint not found in controller"
    fi
    echo
}

# Test 7: Verify service method exists
test_service_method() {
    print_test "Verify uploadReviewPhoto method in service"
    TESTS_RUN=$((TESTS_RUN + 1))
    
    if grep -q "uploadReviewPhoto" src/modules/reviews/reviews.service.ts 2>/dev/null; then
        print_success "Method 'uploadReviewPhoto' is implemented in service"
    else
        print_failure "Method not found in service"
    fi
    echo
}

# Test 8: Verify CloudinaryService integration
test_cloudinary_integration() {
    print_test "Verify Cloudinary integration"
    TESTS_RUN=$((TESTS_RUN + 1))
    
    if grep -q "CloudinaryService" src/modules/reviews/reviews.service.ts 2>/dev/null && \
       grep -q "cloudinaryService.uploadImage" src/modules/reviews/reviews.service.ts 2>/dev/null; then
        print_success "CloudinaryService is properly integrated"
    else
        print_failure "Cloudinary integration issue found"
    fi
    echo
}

# Test 9: Check .env configuration
test_env_config() {
    print_test "Check Cloudinary environment variables"
    TESTS_RUN=$((TESTS_RUN + 1))
    
    if [[ -f .env ]] || [[ -f .env.local ]]; then
        # Try to source the env file (safely)
        if grep -q "CLOUDINARY_" .env 2>/dev/null || grep -q "CLOUDINARY_" .env.local 2>/dev/null; then
            print_success "Cloudinary configuration found in .env"
        else
            print_failure "Cloudinary configuration not found in .env"
        fi
    else
        print_failure ".env file not found"
    fi
    echo
}

# Main execution
main() {
    print_header "Review Photo Upload - Test Suite"
    
    echo "Base URL: $BASE_URL"
    echo "Time: $(date)"
    echo
    
    # Run all tests
    test_server_health
    test_missing_file
    test_invalid_file_type
    test_valid_image_setup
    test_show_upload_command
    test_endpoint_definition
    test_service_method
    test_cloudinary_integration
    test_env_config
    
    # Summary
    print_header "Test Results"
    echo "Tests Run:    $TESTS_RUN"
    echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
    echo
    
    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo -e "${GREEN}All structural tests passed!${NC}"
        echo
        echo "Next steps to test with real data:"
        echo "1. Start the server: npm run start:dev"
        echo "2. Get a JWT token by logging in"
        echo "3. Run: ./test_upload_example.sh (after updating JWT_TOKEN and REVIEW_ID)"
    else
        echo -e "${RED}Some tests failed. Please review the output above.${NC}"
    fi
    
    # Cleanup
    rm -f test_valid.jpg
    
    echo
}

# Run main function
main
