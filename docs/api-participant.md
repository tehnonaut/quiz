# Participant API

## Base URL

```
/participant
```

## Endpoints

### Get Participant

**Request:**

```
GET /participant/:participantId
```

**Description:**
Retrieves the details of a specific participant based on the provided `participantId`.

**Permissions:**

- Public

**URL Parameters:**
| Parameter | Type | Required | Description |
|--------------|--------|----------|-------------|
| participantId | String | Yes | The unique identifier of the participant, mongodb id (24char hex string) |

**Response:**

- **200 OK** – Returns the participant details.
- **400 Bad Request** – Invalid `participantId` format.
- **404 Not Found** – Participant not found.

**Example Request:**

```
GET /participant/1234567890abcdef12345678
```

**Example Response:**

```json
{
	"id": "1234567890abcdef12345678",
	"name": "John Doe",
	"studentId": "S123456",
	"quizId": "1234567890abcdef12345678"
}
```

---

### Create Participant

**Request:**

```
POST /participant
```

**Description:**
Creates a new participant.

**Permissions:**

- Public

**Request Body:**
| Field | Type | Required | Description |
|-----------|--------|----------|-------------|
| name | String | Yes | The name of the participant |
| studentId | String | Yes | The student ID of the participant (can be anything like student number, email, etc.) |
| quizId | String | Yes | The quiz ID associated with the participant, mongodb id (24char hex string) |

**Response:**

- **201 Created** – Participant successfully created.
- **400 Bad Request** – Missing or invalid fields.

**Example Request:**

```json
{
	"name": "Jane Doe",
	"studentId": "S654321",
	"quizId": "1234567890abcdef12345678"
}
```

**Example Response:**

```json
{
	"id": "67890",
	"name": "Jane Doe",
	"studentId": "S654321",
	"quizId": "1234567890abcdef12345678"
}
```
