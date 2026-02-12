"""
Test script for WillContent models
Tests validation with complex-blended sample data
"""

import json
from models.models import WillContent

# Sample data based on TypeScript complex-blended sample
# This is a simplified version for testing core structure
sample_will_content = {
    "willType": "individual",
    "testator": {
        "id": "testator-complex-001",
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
        "email": "johan.vanwyk@vwconstruction.co.za",
        "occupation": "Construction Company Director"
    },
    "maritalStatus": "married",
    "marriage": {
        "status": "married",
        "spouses": [
            {
                "id": "spouse-complex-001",
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
            "id": "child-complex-001",
            "fullName": "Pieter Johannes Van Wyk",
            "idNumber": "9701105456082",
            "dateOfBirth": "1997-01-10",
            "isMinor": False,
            "relationshipToTestator": "biological"
        }
    ],
    "assets": [
        {
            "id": "asset-complex-001",
            "type": "real-estate",
            "description": "Primary Residence",
            "location": "156 Constantia Main Road, Cape Town",
            "estimatedValue": 12500000,
            "currency": "ZAR"
        }
    ],
    "beneficiaries": [
        {
            "id": "ben-complex-001",
            "fullName": "Marina Isabel Da Silva",
            "idNumber": "7511155234089",
            "relationship": "Spouse",
            "dateOfBirth": "1975-11-15",
            "allocationPercentage": 60.0,
            "isMinor": False
        },
        {
            "id": "ben-complex-002",
            "fullName": "Pieter Johannes Van Wyk",
            "idNumber": "9701105456082",
            "relationship": "Son",
            "dateOfBirth": "1997-01-10",
            "allocationPercentage": 40.0,
            "isMinor": False
        }
    ],
    "executors": [
        {
            "id": "exec-complex-001",
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
            "email": "marina.vanwyk@email.co.za",
            "isAlternate": False
        }
    ],
    "witnesses": [
        {
            "id": "wit-complex-001",
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
            "id": "wit-complex-002",
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
    "guardians": [],
    "liabilities": [],
    "digitalAssets": [],
    "revocationClause": "I hereby revoke all previous Wills and testamentary writings made by me.",
    "residuaryClause": "All the rest, residue, and remainder of my estate I give to my spouse.",
    "dateExecuted": "2025-01-15",
    "placeExecuted": "Cape Town, Western Cape, South Africa"
}


def test_basic_validation():
    """Test basic model validation"""
    print("Testing WillContent model validation...")

    try:
        will = WillContent(**sample_will_content)
        print("✓ Basic validation passed")
        print(f"  Testator: {will.testator.fullName}")
        print(f"  Beneficiaries: {len(will.beneficiaries)}")
        print(f"  Assets: {len(will.assets)}")
        print(f"  Executors: {len(will.executors)}")
        print(f"  Witnesses: {len(will.witnesses)}")
        return True
    except Exception as e:
        print(f"✗ Basic validation failed: {str(e)}")
        return False


def test_allocation_validation():
    """Test beneficiary allocation percentage validation"""
    print("\nTesting allocation percentage validation...")

    # Test exceeding 100%
    invalid_data = sample_will_content.copy()
    invalid_data["beneficiaries"] = [
        {
            "id": "ben-001",
            "fullName": "Person One",
            "relationship": "Spouse",
            "allocationPercentage": 60.0,
            "isMinor": False
        },
        {
            "id": "ben-002",
            "fullName": "Person Two",
            "relationship": "Child",
            "allocationPercentage": 50.0,
            "isMinor": False
        }
    ]

    try:
        will = WillContent(**invalid_data)
        print("✗ Should have failed with allocation > 100%")
        return False
    except ValueError as e:
        if "exceed 100%" in str(e):
            print("✓ Allocation validation works correctly")
            return True
        else:
            print(f"✗ Unexpected error: {str(e)}")
            return False


def test_minor_guardian_validation():
    """Test minor beneficiary guardian validation"""
    print("\nTesting minor beneficiary guardian validation...")

    # Test minor without guardian
    invalid_data = sample_will_content.copy()
    invalid_data["beneficiaries"] = [
        {
            "id": "ben-001",
            "fullName": "Minor Child",
            "relationship": "Child",
            "allocationPercentage": 100.0,
            "isMinor": True
            # Missing guardianId
        }
    ]

    try:
        will = WillContent(**invalid_data)
        print("✗ Should have failed - minor without guardian")
        return False
    except ValueError as e:
        if "must have a guardianId" in str(e):
            print("✓ Minor guardian validation works correctly")
            return True
        else:
            print(f"✗ Unexpected error: {str(e)}")
            return False


def test_witness_count_validation():
    """Test minimum witness count validation"""
    print("\nTesting witness count validation...")

    # Test with only 1 witness
    invalid_data = sample_will_content.copy()
    invalid_data["witnesses"] = [invalid_data["witnesses"][0]]

    try:
        will = WillContent(**invalid_data)
        print("✗ Should have failed with < 2 witnesses")
        return False
    except Exception as e:
        # Can be either Pydantic ValidationError or custom ValueError
        error_str = str(e)
        if "Minimum 2 witnesses" in error_str or "at least 2 items" in error_str:
            print("✓ Witness count validation works correctly")
            return True
        else:
            print(f"✗ Unexpected error: {error_str}")
            return False


def test_json_serialization():
    """Test JSON serialization"""
    print("\nTesting JSON serialization...")

    try:
        will = WillContent(**sample_will_content)
        json_data = will.model_dump(mode='json')
        print("✓ JSON serialization works")
        print(f"  Serialized {len(json.dumps(json_data))} bytes")
        return True
    except Exception as e:
        print(f"✗ JSON serialization failed: {str(e)}")
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("WillContent Model Validation Tests")
    print("=" * 60)

    results = []
    results.append(test_basic_validation())
    results.append(test_allocation_validation())
    results.append(test_minor_guardian_validation())
    results.append(test_witness_count_validation())
    results.append(test_json_serialization())

    print("\n" + "=" * 60)
    passed = sum(results)
    total = len(results)
    print(f"Results: {passed}/{total} tests passed")
    print("=" * 60)

    if passed == total:
        print("✓ All tests passed!")
        exit(0)
    else:
        print("✗ Some tests failed")
        exit(1)
