# DocApprove

A document approval workflow application with semantic search capabilities. DocApprove enables teams to manage document submissions, track approval statuses, and search through documentation using AI-powered semantic search.

## Overview

DocApprove provides a streamlined workflow for document approval processes. Users can submit documents for review, approvers can approve or reject submissions, and all team members can search through the document repository using natural language queries powered by vector embeddings.

## Features

### Document Management
- Create new documents with title and content
- Edit existing documents
- Delete documents
- Version history tracking

### Approval Workflow
- **Draft** - Initial document state
- **Pending** - Submitted for review
- **Approved** - Review completed successfully
- **Rejected** - Changes requested

### Multi-Level Approval Chains
- Add multiple approvers in sequence
- Approvers review in defined order
- Track each approver's decision with comments
- Automatic status update when all approvers have responded

### External Reviewers
- Invite external stakeholders via email
- Unique access tokens for secure review
- Guests can approve or reject without system accounts
- Useful for client reviews, legal checks, etc.

### Deadline Tracking
- Set due dates for document approvals
- Track overdue approvals
- Visual indicators for approaching deadlines

### Audit Trail
- Complete history of all document actions
- Track who performed each action
- Timestamps for all events
- Filterable by document or view all activity

### Semantic Search
- AI-powered document search using vector embeddings
- Natural language query support
- Similarity-based ranking of results

### Dashboard & Analytics
- Overview of all documents by status
- Statistics including total, pending, and approved counts
- Weekly approval metrics

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with pgvector extension
- **AI**: Ollama for embeddings
- **Runtime**: Bun

## Prerequisites

- Node.js 18+ or Bun runtime
- PostgreSQL 15+ with pgvector extension
- Ollama instance (optional, for semantic search)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/MachoMono/docapprove.git
cd docapprove
```

2. Install dependencies:
```bash
bun install
```

3. Set up the database:
```sql
CREATE DATABASE docapprove;
CREATE EXTENSION IF NOT EXISTS vector;
```

4. Configure environment variables in `.env.local`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/docapprove
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=nomic-embed-text
NEXT_PUBLIC_API_URL=http://localhost:3000
```

5. Initialize the database schema:
```bash
psql $DATABASE_URL -f migrations/001_wrike_features.sql
```

6. Start the development server:
```bash
bun run dev
```

7. Open http://localhost:3000 in your browser

## Project Structure

```
docapprove/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── documents/      # Document CRUD endpoints
│   │   │   ├── search/         # Semantic search endpoint
│   │   │   └── stats/          # Statistics endpoint
│   │   ├── documents/
│   │   │   ├── [id]/          # Document detail view
│   │   │   └── new/           # New document form
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Dashboard page
│   ├── components/
│   │   ├── DocumentCard.tsx    # Document list item
│   │   ├── Header.tsx         # Navigation header
│   │   ├── Sidebar.tsx        # Sidebar navigation
│   │   └── StatusBadge.tsx    # Status indicator
│   └── lib/
│       ├── db.ts               # Database connection
│       ├── documents.ts        # Document operations
│       └── ollama.ts           # Ollama API client
├── public/                     # Static assets
├── package.json
└── next.config.ts
```

## Database Schema

### Documents Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | VARCHAR(255) | Document title |
| content | TEXT | Document body |
| status | VARCHAR(20) | draft/pending/approved/rejected |
| author | VARCHAR(255) | Document creator |
| embedding | vector(768) | Vector embedding for search |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last modification |

### Document Versions Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| document_id | UUID | Foreign key to documents |
| content | TEXT | Version content |
| version_number | INTEGER | Version sequence |
| created_at | TIMESTAMP | Creation timestamp |

### Approval Chains Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| document_id | UUID | Foreign key to documents |
| approver_email | VARCHAR(255) | Approver email |
| approver_name | VARCHAR(255) | Approver name |
| order | INTEGER | Approval sequence order |
| status | VARCHAR(20) | pending/approved/rejected |
| comment | TEXT | Approver comment |
| resolved_at | TIMESTAMP | Resolution timestamp |
| created_at | TIMESTAMP | Creation timestamp |

### External Reviewers Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| document_id | UUID | Foreign key to documents |
| email | VARCHAR(255) | Reviewer email |
| name | VARCHAR(255) | Reviewer name |
| token | VARCHAR(64) | Unique access token |
| status | VARCHAR(20) | pending/approved/rejected |
| comment | TEXT | Review comment |
| resolved_at | TIMESTAMP | Resolution timestamp |
| created_at | TIMESTAMP | Creation timestamp |

### Approval Deadlines Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| document_id | UUID | Foreign key to documents |
| deadline | TIMESTAMP | Due date |
| created_at | TIMESTAMP | Creation timestamp |

### Audit Logs Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| document_id | UUID | Foreign key to documents |
| action | VARCHAR(50) | Action type |
| actor_email | VARCHAR(255) | Actor email |
| actor_name | VARCHAR(255) | Actor name |
| details | TEXT | Additional details |
| created_at | TIMESTAMP | Creation timestamp |

## API Endpoints

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/documents | List all documents |
| POST | /api/documents | Create new document |
| GET | /api/documents/[id] | Get document by ID |
| PUT | /api/documents/[id] | Update document |
| DELETE | /api/documents/[id] | Delete document |
| POST | /api/documents/[id]/approve | Approve document |
| POST | /api/documents/[id]/reject | Reject document |

### Approval Chains

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/documents/[id]/approvers | Get approval chain |
| POST | /api/documents/[id]/approvers | Add approver |
| DELETE | /api/documents/[id]/approvers?approverId=... | Remove approver |
| POST | /api/documents/[id]/approvers/[approverId] | Resolve approver |

### External Reviewers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/documents/[id]/reviewers | Get external reviewers |
| POST | /api/documents/[id]/reviewers | Add external reviewer |
| DELETE | /api/documents/[id]/reviewers?reviewerId=... | Remove reviewer |
| POST | /api/external/respond | External reviewer response |

### Deadlines

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/documents/[id]/deadline | Get deadline |
| POST | /api/documents/[id]/deadline | Set deadline |
| DELETE | /api/documents/[id]/deadline | Remove deadline |

### Audit Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/documents/[id]/audit | Get document audit log |
| GET | /api/audit | Get all audit logs |

### Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/search?q=query | Semantic search |

### Statistics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/stats | Get dashboard statistics |

## Usage

### Creating a Document
1. Navigate to the Documents page
2. Click "New Document"
3. Enter title and content
4. Click "Create" to save as draft

### Submitting for Review
1. Open a draft document
2. Click "Submit for Review"
3. Document status changes to "pending"

### Approving or Rejecting
1. Open a pending document
2. Click "Approve" or "Reject"
3. Document status updates accordingly

### Searching Documents
1. Use the search bar on the dashboard
2. Enter a natural language query
3. View ranked results by similarity

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | Required |
| OLLAMA_BASE_URL | Ollama API endpoint | http://localhost:11434 |
| OLLAMA_MODEL | Embedding model name | nomic-embed-text |
| NEXT_PUBLIC_API_URL | Public API URL | http://localhost:3000 |

## License

MIT License
