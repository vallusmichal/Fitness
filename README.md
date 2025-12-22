# Fitness App - Submission

This project is a submission for the Fitness App backend assignment available at [GoodRequest/BackendAssignment-Fitness](https://github.com/GoodRequest/BackendAssignment-Fitness).

The implementation covers all required tasks, including bonus tasks #2 (validation) and #4 (error handling).

Development was assisted by generative AI tools to enhance productivity and code quality.

### Requirements

- node.js ^16.0.0
- postgres ^16
- docker

### How to start

- install dependencies with `npm i`
- start the database with `docker-compose up -d` 
- create db schema and populate db with `npm run seed`
- run express server with `npm start`

### How to use

The base URL is `http://localhost:8000`.

All authenticated endpoints require `Authorization: Bearer <token>` header.

Here are some payload examples for the API endpoints:

---

#### 1. Register a new user

**POST** `/users/register`

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John",
  "surname": "Doe",
  "nickName": "johnny",
  "age": 25
}
```

---

#### 2. Login

**POST** `/users/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Returns a JWT token to use in subsequent requests.

---

#### 3. Get current user profile

**GET** `/users/profile`

**Auth:** Required (any role)

No request body required.

---

#### 4. Get all users

**GET** `/users`

**Auth:** Required (any role)

No request body required. Returns limited data for USER role, full data for ADMIN role.

---

#### 5. Get user by ID

**GET** `/users/:id`

**Auth:** Required (ADMIN only)

Example: `GET /users/1`

---

#### 6. Update user

**PUT** `/users/:id`

**Auth:** Required (ADMIN only)

```json
{
  "name": "Jane",
  "surname": "Smith",
  "nickName": "janesmith",
  "age": 30,
  "role": "USER"
}
```

---

#### 7. Get all programs

**GET** `/programs`

**Auth:** Required (any role)

No request body required.

---

#### 8. Get all exercises

**GET** `/exercises`

**Auth:** Required (any role)

No request body required.

---

#### 9. Create exercise

**POST** `/exercises`

**Auth:** Required (ADMIN only)

```json
{
  "name": "Push-ups",
  "difficulty": "MEDIUM",
  "programID": 1
}
```

Difficulty options: `EASY`, `MEDIUM`, `HARD`

---

#### 10. Update exercise

**PUT** `/exercises/:id`

**Auth:** Required (ADMIN only)

```json
{
  "name": "Advanced Push-ups",
  "difficulty": "HARD",
  "programID": 2
}
```

---

#### 11. Delete exercise

**DELETE** `/exercises/:id`

**Auth:** Required (ADMIN only)

Example: `DELETE /exercises/1`

---

#### 12. Add exercise to program

**POST** `/programs/:programId/exercises/:exerciseId`

**Auth:** Required (ADMIN only)

Example: `POST /programs/1/exercises/2`

No request body required.

---

#### 13. Remove exercise from program

**DELETE** `/programs/:programId/exercises/:exerciseId`

**Auth:** Required (ADMIN only)

Example: `DELETE /programs/1/exercises/2`

---

#### 14. Track completed exercise

**POST** `/exercises/completed`

**Auth:** Required (USER only)

```json
{
  "exerciseId": 1,
  "duration": 30,
  "completedAt": "2024-01-15T10:30:00Z"
}
```

`completedAt` is optional (defaults to current time).

---

#### 15. Get my completed exercises

**GET** `/exercises/completed`

**Auth:** Required (USER only)

No request body required.

---

#### 16. Delete completed exercise

**DELETE** `/exercises/completed/:id`

**Auth:** Required (USER only)

Example: `DELETE /exercises/completed/1`

Users can only delete their own completed exercises.

