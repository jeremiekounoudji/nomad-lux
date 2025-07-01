# Like/Unlike Property Functionality

## Overview
The "Like/Unlike Property" feature allows authenticated users to like or unlike properties. Each property displays a like count, and users can view all properties they have liked. This system is optimized for performance and scalability.

---

## Database Schema

### Table: property_likes
| Column      | Type      | Description                        |
|-------------|-----------|------------------------------------|
| id          | bigint PK | Unique identifier                  |
| user_id     | uuid      | References users(id)               |
| property_id | uuid      | References property(id)            |
| liked_at    | timestamp | When the like was created          |

- **Index:** Unique index on `(user_id, property_id)` for fast lookup and to prevent duplicate likes.

### Table: property
- Add column: `like_count integer NOT NULL DEFAULT 0`
  - This is incremented/decremented on like/unlike actions.

---

## Supabase Functions

### Direct Table Operations
- **Like a property:**  
  - Insert into `property_likes` if not exists.
  - Increment `property.like_count` by 1.
- **Unlike a property:**  
  - Delete from `property_likes`.
  - Decrement `property.like_count` by 1 (ensure it doesn't go below 0).
- **Get like count:**  
  - Read `property.like_count` directly from the `property` table.

### RPC Functions
- **get_user_liked_properties_paginated(user_id, page, page_size):**
  - Returns a paginated list of properties liked by the user.
  - Only this function is implemented as an RPC for flexibility and security.

### Cleanup
- Delete any existing like-related RPCs that are not needed.

---

## Frontend Integration

- **State Management:**  
  - Use Zustand to store the list of liked property IDs for the current user.
- **Hooks:**  
  - Custom hooks for like/unlike actions and fetching liked properties.
- **UI:**  
  - All property cards display a like icon and the like count.
  - Like/unlike actions update the UI optimistically and sync with the backend.
  - Like/unlike requires authentication.

---

## Error Handling & Security

- All actions require the user to be authenticated.
- Like/unlike actions are idempotent and safe for repeated calls.
- Like count is always kept in sync with the number of rows in `property_likes`.

---

## Example Usage

- **Liking a property:**  
  - User clicks the like icon → insert into `property_likes` → increment `property.like_count`.
- **Unliking a property:**  
  - User clicks the like icon again → delete from `property_likes` → decrement `property.like_count`.
- **Fetching liked properties:**  
  - Use the RPC to get a paginated list for the user's "Liked Properties" page.

---

## Migration Plan

1. Create `property_likes` table and index.
2. Add `like_count` column to `property`.
3. Implement direct queries for like/unlike and like count.
4. Implement RPC for paginated liked properties.
5. Remove any obsolete like-related RPCs. 