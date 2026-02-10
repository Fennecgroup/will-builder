"""
Test the FastAPI endpoint with complex will content
"""

import json
import sys
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def load_complex_will_sample():
    """Load complex will sample data"""
    return {
        "willType": "individual",
        "testator": {
            "id": "testator-001",
            "fullName": "Johannes Petrus Van Wyk",
            "dateOfBirth": "1969-09-10",
            "idNumber": "6909105123084",
            "address": {
                "street": "156 Constantia Main Road",
                "city": "Cape Town",
                "state": "Western Cape",
                "postalCode": "7806",
                "country": "South Africa"
            },
            "phone": "+27 82 567 8901",
            "email": "johan.vanwyk@example.co.za",
            "occupation": "Construction Company Director"
        },
        "maritalStatus": "married",
        "marriage": {
            "status": "married",
            "spouses": [
                {
                    "id": "spouse-001",
                    "fullName": "Marina Isabel Da Silva",
                    "idNumber": "7511155234089",
                    "dateOfBirth": "1975-11-15",
                    "dateOfMarriage": "2018-06-20",
                    "maritalRegime": "OCOP-A"
                }
            ]
        },
        "children": [
            {
                "id": "child-001",
                "fullName": "Emma Sofia Van Wyk",
                "dateOfBirth": "2015-08-20",
                "isMinor": True,
                "relationshipToTestator": "biological"
            }
        ],
        "assets": [
            {
                "id": "asset-001",
                "type": "real-estate",
                "description": "Primary Residence",
                "location": "156 Constantia Main Road, Cape Town",
                "estimatedValue": 12500000,
                "currency": "ZAR"
            },
            {
                "id": "asset-002",
                "type": "bank-account",
                "description": "Savings Account",
                "accountNumber": "****3456",
                "estimatedValue": 2500000,
                "currency": "ZAR"
            }
        ],
        "beneficiaries": [
            {
                "id": "ben-001",
                "fullName": "Marina Isabel Da Silva",
                "idNumber": "7511155234089",
                "relationship": "Spouse",
                "dateOfBirth": "1975-11-15",
                "allocationPercentage": 60.0,
                "isMinor": False
            },
            {
                "id": "ben-002",
                "fullName": "Emma Sofia Van Wyk",
                "relationship": "Daughter",
                "dateOfBirth": "2015-08-20",
                "allocationPercentage": 40.0,
                "isMinor": True,
                "guardianId": "guard-001"
            }
        ],
        "executors": [
            {
                "id": "exec-001",
                "fullName": "Marina Isabel Da Silva",
                "idNumber": "7511155234089",
                "relationship": "Spouse",
                "address": {
                    "street": "156 Constantia Main Road",
                    "city": "Cape Town",
                    "state": "Western Cape",
                    "postalCode": "7806",
                    "country": "South Africa"
                },
                "phone": "+27 83 678 9012",
                "email": "marina.vanwyk@example.co.za",
                "isAlternate": False
            }
        ],
        "witnesses": [
            {
                "id": "wit-001",
                "fullName": "Susan Margaret Thompson",
                "idNumber": "7207125678093",
                "address": {
                    "street": "23 Kildare Road",
                    "city": "Newlands",
                    "state": "Western Cape",
                    "postalCode": "7700",
                    "country": "South Africa"
                },
                "phone": "+27 82 789 0123",
                "occupation": "Chartered Accountant",
                "dateWitnessed": "2025-01-15"
            },
            {
                "id": "wit-002",
                "fullName": "Michael John Roberts",
                "idNumber": "7109145789082",
                "address": {
                    "street": "67 Main Road",
                    "city": "Claremont",
                    "state": "Western Cape",
                    "postalCode": "7708",
                    "country": "South Africa"
                },
                "phone": "+27 83 890 1234",
                "occupation": "Attorney",
                "dateWitnessed": "2025-01-15"
            }
        ],
        "guardians": [
            {
                "id": "guard-001",
                "fullName": "Marina Isabel Da Silva",
                "idNumber": "7511155234089",
                "relationship": "Mother",
                "address": {
                    "street": "156 Constantia Main Road",
                    "city": "Cape Town",
                    "state": "Western Cape",
                    "postalCode": "7806",
                    "country": "South Africa"
                },
                "phone": "+27 83 678 9012",
                "email": "marina.vanwyk@example.co.za",
                "forChildren": ["child-001"],
                "isAlternate": False
            }
        ],
        "liabilities": [
            {
                "id": "liab-001",
                "type": "mortgage",
                "creditor": "Nedbank Private Wealth",
                "amount": 4500000,
                "currency": "ZAR",
                "accountNumber": "****4567",
                "notes": "Bond on primary residence"
            }
        ],
        "digitalAssets": [
            {
                "id": "digital-001",
                "type": "email",
                "platform": "Gmail",
                "username": "johan.vanwyk@example.co.za",
                "instructions": "Close account after archiving important emails",
                "beneficiaryId": "ben-001"
            }
        ],
        "funeralWishes": {
            "preference": "burial",
            "location": "Stellenbosch Cemetery, Western Cape",
            "specificInstructions": "Private family ceremony",
            "prePaid": False,
            "religiousPreferences": "Reformed Church ceremony"
        },
        "specialInstructions": "All debts and funeral expenses to be paid from estate before distribution.",
        "revocationClause": "I hereby revoke all previous Wills and testamentary writings made by me.",
        "residuaryClause": "All the rest, residue, and remainder of my estate I give to my spouse Marina Isabel Da Silva, failing whom to my daughter Emma Sofia Van Wyk.",
        "minorBeneficiaryProvisions": {
            "method": "guardian-fund",
            "ageOfInheritance": 25,
            "instructions": "Funds to be released at age 25 for education and general use"
        },
        "attestationClause": "SIGNED at Cape Town on this 15th day of January 2025, in the presence of the undersigned witnesses.",
        "dateExecuted": "2025-01-15",
        "placeExecuted": "Cape Town, Western Cape, South Africa"
    }


def test_health_check():
    """Test health check endpoint"""
    print("Testing health check endpoint...")
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    print("✓ Health check passed")


def test_root_endpoint():
    """Test root endpoint"""
    print("\nTesting root endpoint...")
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "active"
    print("✓ Root endpoint passed")


def test_create_will_valid():
    """Test creating will with valid data"""
    print("\nTesting will creation with valid data...")
    will_data = load_complex_will_sample()

    response = client.post("/api/v1/testator", json=will_data)

    print(f"Response status: {response.status_code}")

    if response.status_code != 201:
        print(f"Error response: {response.json()}")
        sys.exit(1)

    data = response.json()
    assert data["success"] == True
    assert "will_id" in data
    assert "WILL-" in data["will_id"]
    print(f"✓ Will created successfully with ID: {data['will_id']}")


def test_create_will_invalid_allocation():
    """Test will creation with invalid allocation (> 100%)"""
    print("\nTesting will creation with invalid allocation...")
    will_data = load_complex_will_sample()

    # Modify beneficiary allocations to exceed 100%
    will_data["beneficiaries"][0]["allocationPercentage"] = 70.0
    will_data["beneficiaries"][1]["allocationPercentage"] = 50.0

    response = client.post("/api/v1/testator", json=will_data)

    assert response.status_code == 422
    print("✓ Invalid allocation correctly rejected")


def test_create_will_missing_guardian():
    """Test will creation with minor beneficiary missing guardian"""
    print("\nTesting will creation with minor missing guardian...")
    will_data = load_complex_will_sample()

    # Remove guardianId from minor beneficiary
    will_data["beneficiaries"][1]["guardianId"] = None

    response = client.post("/api/v1/testator", json=will_data)

    assert response.status_code == 422
    print("✓ Missing guardian correctly rejected")


def test_create_will_insufficient_witnesses():
    """Test will creation with insufficient witnesses"""
    print("\nTesting will creation with insufficient witnesses...")
    will_data = load_complex_will_sample()

    # Keep only one witness
    will_data["witnesses"] = [will_data["witnesses"][0]]

    response = client.post("/api/v1/testator", json=will_data)

    assert response.status_code == 422
    print("✓ Insufficient witnesses correctly rejected")


def test_openapi_schema():
    """Test OpenAPI schema generation"""
    print("\nTesting OpenAPI schema generation...")
    response = client.get("/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    assert "openapi" in schema
    assert "paths" in schema
    assert "/api/v1/testator" in schema["paths"]
    print("✓ OpenAPI schema generated successfully")


if __name__ == "__main__":
    print("=" * 60)
    print("FastAPI Endpoint Tests")
    print("=" * 60)

    try:
        test_health_check()
        test_root_endpoint()
        test_create_will_valid()
        test_create_will_invalid_allocation()
        test_create_will_missing_guardian()
        test_create_will_insufficient_witnesses()
        test_openapi_schema()

        print("\n" + "=" * 60)
        print("✓ All API tests passed!")
        print("=" * 60)
        sys.exit(0)

    except AssertionError as e:
        print(f"\n✗ Test failed: {str(e)}")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
