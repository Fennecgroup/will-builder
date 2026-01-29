"""
Test usufruct functionality in WillContent models
"""

import json
from models import WillContent, UsufructConfig
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_usufruct_model_validation():
    """Test usufruct configuration in assets"""
    print("Testing usufruct model validation...")

    will_data = {
        "willType": "individual",
        "testator": {
            "id": "testator-001",
            "fullName": "Johannes Van Wyk",
            "dateOfBirth": "1969-09-10",
            "idNumber": "6909105123084",
            "address": {
                "street": "156 Main Road",
                "city": "Cape Town",
                "state": "Western Cape",
                "postalCode": "7806",
                "country": "South Africa"
            },
            "phone": "+27 82 567 8901",
            "email": "johan@example.co.za",
            "occupation": "Director"
        },
        "maritalStatus": "married",
        "marriage": {
            "status": "married",
            "spouses": [
                {
                    "id": "spouse-001",
                    "fullName": "Marina Da Silva",
                    "idNumber": "7511155234089",
                    "dateOfBirth": "1975-11-15",
                    "dateOfMarriage": "2018-06-20",
                    "maritalRegime": "OCOP-A"
                }
            ]
        },
        "assets": [
            {
                "id": "asset-001",
                "type": "real-estate",
                "description": "Primary Residence with Usufruct",
                "location": "156 Main Road, Cape Town",
                "estimatedValue": 12500000,
                "currency": "ZAR",
                # USUFRUCT: Spouse gets use, son gets bare ownership
                "usufruct": {
                    "usufructuaryId": "ben-001",  # Spouse - can live in house
                    "bareDominiumOwnerId": "ben-002",  # Son - owns the property
                    "terminationType": "death"  # Ends when spouse dies
                }
            },
            {
                "id": "asset-002",
                "type": "bank-account",
                "description": "Savings Account",
                "estimatedValue": 500000,
                "currency": "ZAR"
                # No usufruct on this asset
            }
        ],
        "beneficiaries": [
            {
                "id": "ben-001",
                "fullName": "Marina Da Silva",
                "idNumber": "7511155234089",
                "relationship": "Spouse",
                "allocationPercentage": 50.0,
                "isMinor": False
            },
            {
                "id": "ben-002",
                "fullName": "Pieter Van Wyk",
                "idNumber": "9701105456082",
                "relationship": "Son",
                "allocationPercentage": 50.0,
                "isMinor": False
            }
        ],
        "executors": [
            {
                "id": "exec-001",
                "fullName": "Marina Da Silva",
                "idNumber": "7511155234089",
                "relationship": "Spouse",
                "address": {
                    "street": "156 Main Road",
                    "city": "Cape Town",
                    "state": "Western Cape",
                    "postalCode": "7806",
                    "country": "South Africa"
                },
                "phone": "+27 83 678 9012",
                "email": "marina@example.co.za"
            }
        ],
        "witnesses": [
            {
                "id": "wit-001",
                "fullName": "Susan Thompson",
                "idNumber": "7207125678093",
                "address": {
                    "street": "23 Kildare Road",
                    "city": "Cape Town",
                    "state": "Western Cape",
                    "postalCode": "7700",
                    "country": "South Africa"
                },
                "phone": "+27 82 789 0123"
            },
            {
                "id": "wit-002",
                "fullName": "Michael Roberts",
                "idNumber": "7109145789082",
                "address": {
                    "street": "67 Main Road",
                    "city": "Cape Town",
                    "state": "Western Cape",
                    "postalCode": "7708",
                    "country": "South Africa"
                },
                "phone": "+27 83 890 1234"
            }
        ],
        "guardians": [],
        "liabilities": [],
        "digitalAssets": [],
        "revocationClause": "I revoke all previous wills.",
        "residuaryClause": "All remaining assets to my beneficiaries.",
        "dateExecuted": "2025-01-15",
        "placeExecuted": "Cape Town"
    }

    try:
        # Test model validation
        will = WillContent(**will_data)
        print("✓ Usufruct model validation passed")

        # Check usufruct is properly stored
        asset_with_usufruct = will.assets[0]
        assert asset_with_usufruct.usufruct is not None
        assert asset_with_usufruct.usufruct.usufructuaryId == "ben-001"
        assert asset_with_usufruct.usufruct.bareDominiumOwnerId == "ben-002"
        assert asset_with_usufruct.usufruct.terminationType.value == "death"
        print("✓ Usufruct configuration correctly stored")

        # Check asset without usufruct
        asset_without_usufruct = will.assets[1]
        assert asset_without_usufruct.usufruct is None
        print("✓ Optional usufruct correctly handled")

        return True

    except Exception as e:
        print(f"✗ Usufruct validation failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_usufruct_api_endpoint():
    """Test usufruct through API endpoint"""
    print("\nTesting usufruct via API endpoint...")

    will_data = {
        "willType": "individual",
        "testator": {
            "id": "testator-usufruct-001",
            "fullName": "Test Testator",
            "dateOfBirth": "1970-01-01",
            "idNumber": "7001015123084",
            "address": {
                "street": "123 Test Street",
                "city": "Test City",
                "state": "Test State",
                "postalCode": "1234",
                "country": "South Africa"
            },
            "phone": "+27 82 123 4567",
            "email": "test@example.co.za"
        },
        "maritalStatus": "married",
        "marriage": {
            "status": "married",
            "spouses": [
                {
                    "id": "spouse-usufruct-001",
                    "fullName": "Test Spouse",
                    "maritalRegime": "OCOP-A"
                }
            ]
        },
        "assets": [
            {
                "id": "asset-usufruct-001",
                "type": "real-estate",
                "description": "Family Home with Usufruct Rights",
                "estimatedValue": 5000000,
                "currency": "ZAR",
                "usufruct": {
                    "usufructuaryId": "ben-usufruct-001",
                    "bareDominiumOwnerId": "ben-usufruct-002",
                    "terminationType": "death"
                }
            }
        ],
        "beneficiaries": [
            {
                "id": "ben-usufruct-001",
                "fullName": "Usufructuary Beneficiary",
                "relationship": "Spouse",
                "allocationPercentage": 50.0,
                "isMinor": False
            },
            {
                "id": "ben-usufruct-002",
                "fullName": "Bare Owner Beneficiary",
                "relationship": "Child",
                "allocationPercentage": 50.0,
                "isMinor": False
            }
        ],
        "executors": [
            {
                "id": "exec-usufruct-001",
                "fullName": "Test Executor",
                "idNumber": "8001015123084",
                "relationship": "Attorney",
                "address": {
                    "street": "456 Legal Street",
                    "city": "Test City",
                    "state": "Test State",
                    "postalCode": "1234",
                    "country": "South Africa"
                },
                "phone": "+27 82 765 4321",
                "email": "executor@example.co.za"
            }
        ],
        "witnesses": [
            {
                "id": "wit-usufruct-001",
                "fullName": "Witness One",
                "idNumber": "7501015123084",
                "address": {
                    "street": "789 Witness Road",
                    "city": "Test City",
                    "state": "Test State",
                    "postalCode": "1234",
                    "country": "South Africa"
                }
            },
            {
                "id": "wit-usufruct-002",
                "fullName": "Witness Two",
                "idNumber": "7601015123084",
                "address": {
                    "street": "321 Observer Lane",
                    "city": "Test City",
                    "state": "Test State",
                    "postalCode": "1234",
                    "country": "South Africa"
                }
            }
        ],
        "guardians": [],
        "liabilities": [],
        "digitalAssets": [],
        "revocationClause": "I revoke all previous wills.",
        "residuaryClause": "All remaining assets to beneficiaries.",
        "dateExecuted": "2025-01-29",
        "placeExecuted": "Test City"
    }

    try:
        response = client.post("/api/v1/testator", json=will_data)

        if response.status_code != 201:
            print(f"✗ API request failed: {response.status_code}")
            print(f"  Response: {response.json()}")
            return False

        data = response.json()
        assert data["success"] == True
        print(f"✓ Usufruct data accepted by API endpoint")
        print(f"  Will ID: {data['will_id']}")

        return True

    except Exception as e:
        print(f"✗ API test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_usufruct_json_serialization():
    """Test usufruct JSON serialization"""
    print("\nTesting usufruct JSON serialization...")

    usufruct_config = UsufructConfig(
        usufructuaryId="beneficiary-spouse",
        bareDominiumOwnerId="beneficiary-child",
        terminationType="death"
    )

    try:
        # Test model_dump
        usufruct_dict = usufruct_config.model_dump()
        assert usufruct_dict["usufructuaryId"] == "beneficiary-spouse"
        assert usufruct_dict["bareDominiumOwnerId"] == "beneficiary-child"
        assert usufruct_dict["terminationType"] == "death"
        print("✓ Usufruct serialization works correctly")

        # Test JSON string
        json_str = usufruct_config.model_dump_json()
        assert "usufructuaryId" in json_str
        assert "beneficiary-spouse" in json_str
        print("✓ Usufruct JSON string generation works")

        return True

    except Exception as e:
        print(f"✗ Serialization test failed: {str(e)}")
        return False


def test_usufruct_explanation():
    """Print explanation of usufruct functionality"""
    print("\n" + "=" * 70)
    print("USUFRUCT FUNCTIONALITY EXPLANATION")
    print("=" * 70)
    print("""
Usufruct is a legal concept in South African law that splits ownership:

1. USUFRUCTUARY (usufructuaryId):
   - Has the right to USE and ENJOY the asset
   - Can live in the house, collect rental income, etc.
   - Typically the surviving spouse

2. BARE OWNER (bareDominiumOwnerId):
   - Owns the asset but cannot use it while usufruct is active
   - Typically the children
   - Gets full ownership when usufruct terminates

3. TERMINATION (terminationType):
   - Currently only 'death' is supported
   - When the usufructuary dies, the bare owner gets full ownership

EXAMPLE:
  Asset: Family home worth R12.5 million
  Usufructuary: Spouse (can live in the house until death)
  Bare Owner: Adult son (owns the house but cannot use it yet)
  Termination: When spouse dies, son gets full ownership and use

This is commonly used in wills to:
- Protect surviving spouse (they can stay in the home)
- Ensure asset goes to children eventually
- Avoid disputes between spouse and children
    """)
    print("=" * 70)


if __name__ == "__main__":
    print("=" * 70)
    print("USUFRUCT FUNCTIONALITY TESTS")
    print("=" * 70)

    results = []
    results.append(test_usufruct_model_validation())
    results.append(test_usufruct_api_endpoint())
    results.append(test_usufruct_json_serialization())

    test_usufruct_explanation()

    print("\n" + "=" * 70)
    passed = sum(results)
    total = len(results)
    print(f"Results: {passed}/{total} usufruct tests passed")
    print("=" * 70)

    if passed == total:
        print("✓ All usufruct tests passed!")
        print("\nUsufruct is FULLY SUPPORTED in the API:")
        print("  - UsufructConfig model defined")
        print("  - Asset.usufruct field available (optional)")
        print("  - Validation working correctly")
        print("  - API endpoint accepts usufruct data")
        print("  - JSON serialization working")
        exit(0)
    else:
        print("✗ Some usufruct tests failed")
        exit(1)
