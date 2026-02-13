# Fennec Will Builder API

FastAPI-based REST API for accepting and processing external testator information for will creation.

## Features

- Accept comprehensive testator information via REST API
- Validate testator data using Pydantic models
- Support for multiple beneficiaries, executors, and guardians
- Asset tracking and distribution management
- CORS-enabled for frontend integration
- Auto-generated OpenAPI documentation
- Health check endpoint for monitoring

## Project Structure

```
external_api/
├── main.py              # FastAPI application entry point
├── models.py            # Pydantic data models
├── config.py            # Application configuration
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variables template
└── README.md           # This file
```

## Setup

### Prerequisites

- Python 3.11 or higher
- pip (Python package manager)

### Installation

1. **Create a virtual environment**

   ```bash
   cd external_api
   python -m venv venv
   ```

2. **Activate the virtual environment**

   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

   - On Windows:
     ```bash
     venv\Scripts\activate
     ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and update the values as needed, especially:
   - `SECRET_KEY` - Generate a secure key for production
   - `ALLOWED_ORIGINS` - Add your frontend URL
   - Database settings if using a database

## Running the Application

### Development Mode

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- Main API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### Health Check

```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-22T10:30:00",
  "service": "will-builder-api"
}
```

### Create Testator

```http
POST /api/v1/testator
Content-Type: application/json
```

Request body example:
```json
{
  "personal_info": {
    "full_name": "John Doe",
    "id_number": "8001015009087",
    "date_of_birth": "1980-01-01",
    "gender": "male",
    "email": "john.doe@example.com",
    "phone": "+27821234567",
    "address": {
      "street_address": "123 Main Street",
      "city": "Johannesburg",
      "state_province": "Gauteng",
      "postal_code": "2000",
      "country": "South Africa"
    },
    "marital_status": "married",
    "nationality": "South African"
  },
  "beneficiaries": [
    {
      "full_name": "Jane Doe",
      "relationship": "spouse",
      "email": "jane.doe@example.com",
      "is_minor": false
    }
  ],
  "distributions": [
    {
      "beneficiary_name": "Jane Doe",
      "distribution_type": "percentage",
      "percentage": 100
    }
  ],
  "executors": [
    {
      "full_name": "Robert Smith",
      "id_number": "7505055008088",
      "email": "robert@example.com",
      "phone": "+27827654321",
      "address": {
        "street_address": "456 Oak Avenue",
        "city": "Cape Town",
        "state_province": "Western Cape",
        "postal_code": "8000",
        "country": "South Africa"
      },
      "relationship": "friend",
      "is_alternate": false
    }
  ]
}
```

Response:
```json
{
  "success": true,
  "testator_id": "TEST-1706005800.123",
  "message": "Testator information received successfully",
  "timestamp": "2024-01-22T10:30:00"
}
```

## Data Models

### Key Models

- **TestatorInfo**: Complete testator information including personal details, beneficiaries, assets, etc.
- **PersonalInfo**: Testator's personal information (name, ID, contact details)
- **Beneficiary**: Information about will beneficiaries
- **Distribution**: How assets should be distributed
- **Asset**: Information about testator's assets
- **Executor**: Executor/administrator information
- **Guardian**: Guardian appointments for minor children

See `models.py` for complete model definitions and validation rules.

## Validation Rules

- Testator must be at least 18 years old
- Percentage-based distributions cannot exceed 100%
- Minor beneficiaries must have a guardian specified
- All required fields must be provided

## Development

### Adding New Endpoints

1. Define request/response models in `models.py`
2. Add route handler in `main.py`
3. Implement business logic
4. Update this README

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-cov httpx

# Run tests
pytest

# Run with coverage
pytest --cov=.
```

## Security Considerations

- Change `SECRET_KEY` in production
- Use HTTPS in production
- Implement rate limiting
- Add authentication/authorization as needed
- Validate all input data
- Sanitize data before storage

## TODO

- [ ] Implement database integration
- [ ] Add authentication and authorization
- [ ] Implement testator retrieval endpoint
- [ ] Add update and delete operations
- [ ] Integrate with will generation service
- [ ] Add comprehensive error handling
- [ ] Implement logging to external service
- [ ] Add unit and integration tests
- [ ] Set up CI/CD pipeline

## License

Proprietary - Fennec Will Builder

## Support

For issues or questions, contact the development team.
