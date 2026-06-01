# Implementation Plan: Enhanced Dashboard, Mining Management, and Admin Features

## Overview

This implementation plan breaks down the development of the enhanced trading platform into discrete, incremental coding tasks. The plan follows a logical progression: first establishing the data models and backend infrastructure, then implementing the dashboard and mining features, and finally extending the admin panel with comprehensive management modules. Each task builds on previous work and includes specific requirements references for traceability.

**Implementation Language:** TypeScript (as specified in the design document)
- Frontend: React 18 with TypeScript
- Backend: Node.js/Express with TypeScript
- All code examples and implementations will use TypeScript syntax and type safety features

**Key Project Paths:**
- Backend: `d:\tardsss\backend\` (index.ts, models.ts)
- Frontend: `d:\tardsss\trass\src\components\`
- Existing components: Dashboard.tsx, AdminPanel.tsx, AuthPage.tsx, MiningPage.tsx

**Architecture Context:**
- The backend uses a smart model proxy pattern (createSmartModel) that provides MongoDB/JSON fallback
- Authentication uses Firebase Admin SDK with requireAuth middleware
- Real-time updates use Socket.IO for WebSocket communication
- Frontend uses React Router for navigation and Framer Motion for animations
- Styling uses Tailwind CSS with existing design system patterns

**Recent Updates to This Task List:**
- Enhanced task descriptions with more specific implementation details
- Added explicit file paths and code locations for each task
- Clarified data model integration with existing smart model proxy pattern
- Improved API endpoint descriptions with request/response formats
- Added validation rules and error handling requirements
- Specified permission checks and authentication middleware usage
- Clarified which endpoints may already exist and need extension vs creation
- Improved test task descriptions with specific test scenarios
- Added architecture context for better understanding of existing patterns

## Tasks

- [ ] 1. Set up data models and database schema
  - [x] 1.1 Create MiningSession model in backend
    - **File:** `d:\tardsss\backend\models.ts`
    - **Location:** Add after existing model schemas (User, Trade, Transaction, etc.)
    - **TypeScript Interface:** Define MiningSession with fields: id (string), userId (string), coinSymbol (string), coinName (string), startTime (Date), endTime (Date), duration (number in minutes), difficulty ('easy'|'medium'|'hard'), fee (number), estimatedReward (number), actualReward (number, optional), status ('active'|'completed'|'cancelled'|'failed'), progress (number 0-100), errorMessage (string, optional)
    - **Mongoose Schema:** Create with validation rules: duration min 5 max 1440, fee min 0, progress min 0 max 100, status enum validation
    - **Indexes:** Add compound index on { userId: 1, status: 1 } and single index on { startTime: -1 } for efficient queries
    - **Integration:** Use createSmartModel('MiningSession', miningSessionModel) pattern for MongoDB/JSON fallback
    - **Export:** Export as: `export const MiningSession = createSmartModel('MiningSession', miningSessionModel) as any;`
    - _Requirements: 2.8, 2.12_
  
  - [x] 1.2 Extend Transaction model with new transaction types
    - Update transactionSchema in backend/models.ts
    - Extend type enum to include: 'mining_fee', 'mining_reward', 'admin_credit', 'admin_debit', 'trade_profit', 'trade_loss'
    - Add optional metadata field: { coinSymbol?: string, tradeId?: string, miningSessionId?: string, adminId?: string, reason?: string }
    - Add balanceBefore and balanceAfter fields (type: Number) for audit trail
    - Update MockModel SCHEMA_DEFAULTS to include new transaction types
    - _Requirements: 2.8, 4.11, 6.7_
  
  - [ ] 1.3 Create Wallet model for wallet management
    - Add Wallet interface and schema to backend/models.ts
    - Define TypeScript interface: userId, balance, frozenBalance, status, lastActivity, createdAt, freezeReason, freezeBy, freezeAt
    - Create Mongoose schema with validation: balance >= 0, frozenBalance >= 0, status enum (active/frozen/restricted)
    - Create unique index on userId field
    - Integrate with createSmartModel() for MongoDB/JSON fallback
    - Export as: export const Wallet = createSmartModel('Wallet', walletModel) as any;
    - _Requirements: 6.2, 6.9, 6.11, 6.12_
  
  - [-] 1.4 Create PlatformSettings model
    - Add PlatformSettings interface and schema to backend/models.ts
    - Define TypeScript interface with nested sections: general, trading, mining, kyc, notifications, lastModified, lastModifiedBy
    - Create Mongoose schema with nested objects for each section
    - Add validation: minTradeAmount < maxTradeAmount, maxLeverage (1-100), commissionRate (0-1), binaryDurations array of positive integers
    - Implement single-document pattern (use findOneAndUpdate with upsert: true)
    - Export as: export const PlatformSettings = createSmartModel('PlatformSettings', platformSettingsModel) as any;
    - _Requirements: 7.3, 7.4, 7.5, 7.6, 7.7_
  
  - [-] 1.5 Enhance CustomAsset model for coin management
    - Review existing customAssetSchema in backend/models.ts
    - Add isCustom field (type: Boolean, default: true) to distinguish custom vs system coins
    - Add createdBy field (type: String) to track admin who created the coin
    - Extend Manipulation schema to include strength field (type: Number, min: 1, max: 10)
    - Ensure existing validation for symbol, price, volatility is sufficient
    - No changes to export needed (already using createSmartModel)
    - _Requirements: 3.2, 3.3, 3.4, 3.9_


- [ ] 2. Implement backend API endpoints for mining system
  - [~] 2.1 Create POST /api/mining/start endpoint
    - Add route handler in backend/index.ts after existing user routes
    - Apply requireAuth middleware to protect endpoint
    - Extract userId/email from req (set by requireAuth middleware)
    - Validate request body: { coinSymbol: string, duration?: number }
    - Query User model to get current balance
    - Calculate mining fee based on coin and duration (e.g., 1% of estimated reward)
    - Check if user has sufficient balance (balance >= fee)
    - Check for existing active mining session (status: 'active') for user
    - If validation passes: create MiningSession record with status 'active', progress 0
    - Deduct fee from user balance and create Transaction record (type: 'mining_fee')
    - Start background timer using setTimeout to auto-complete mining after duration
    - Return success response with mining session data
    - Handle errors with appropriate status codes (400 for validation, 500 for server errors)
    - _Requirements: 2.3, 2.5, 2.9, 2.10_
  
  - [~] 2.2 Create GET /api/mining/status/:userId endpoint
    - Add route handler in backend/index.ts
    - Apply requireAuth middleware
    - Extract userId from URL params
    - Query MiningSession model for active session (status: 'active') for userId
    - Query MiningSession model for history (status: 'completed' or 'failed'), limit 50, sort by startTime desc
    - Query User model to get current balance
    - Return response: { activeMining: MiningSession | null, history: MiningSession[], balance: number }
    - _Requirements: 2.2, 2.8_
  
  - [~] 2.3 Implement mining completion logic
    - Create helper function completeMiningSession(sessionId: string) in backend/index.ts
    - Query MiningSession by sessionId
    - Calculate actual reward based on difficulty: easy (1.5x), medium (2x), hard (3x) of base reward
    - Update user balance by adding reward
    - Create Transaction record (type: 'mining_reward', amount: reward, metadata: { miningSessionId, coinSymbol })
    - Update MiningSession: status = 'completed', actualReward = reward, progress = 100
    - Emit Socket.IO event 'mining:complete' to user with session data
    - Call this function from setTimeout in POST /api/mining/start
    - _Requirements: 2.7, 2.8_
  
  - [~] 2.4 Implement mining progress WebSocket events
    - In POST /api/mining/start, after creating session, start progress interval
    - Use setInterval to emit progress every 10 seconds
    - Calculate progress: (elapsed time / total duration) * 100
    - Emit Socket.IO event 'mining:progress' to specific user socket with { sessionId, progress, remainingTime }
    - Update MiningSession.progress field in database on each emit
    - Clear interval when mining completes or on server shutdown
    - Store interval ID in a Map<sessionId, NodeJS.Timeout> for cleanup
    - _Requirements: 2.6, 2.12_
  
  - [ ]* 2.5 Write unit tests for mining endpoints
    - Create test file backend/tests/mining.test.ts
    - Test POST /api/mining/start with sufficient balance (expect 200, session created)
    - Test POST /api/mining/start with insufficient balance (expect 400, error message)
    - Test POST /api/mining/start with active session (expect 400, concurrent mining prevented)
    - Test GET /api/mining/status returns active session and history
    - Test mining completion updates balance and creates transaction
    - Mock MiningSession, User, Transaction models using jest.mock
    - Mock Socket.IO emit function
    - _Requirements: 2.9, 2.10_


- [ ] 3. Implement backend API endpoints for coin management
  - [~] 3.1 Create POST /api/admin/market/add endpoint (or extend existing)
    - Check if endpoint exists in backend/index.ts, if yes extend it, if no create it
    - Apply requireAuth middleware and check 'market_control' permission using checkPermission()
    - Extract admin email from req.email (set by requireAuth)
    - Validate request body: { id: string, name: string, price: number, volatility: number, type: string, manipulation?: { direction, duration, unit } }
    - Check CustomAsset model for existing asset with same id (ensure uniqueness)
    - Validate: price > 0, volatility between 0.01-0.5, id is 2-10 alphanumeric chars
    - Create CustomAsset record with isCustom: true, createdBy: admin email
    - If manipulation provided: create Manipulation record with calculated endTime
    - Add asset to in-memory assets array
    - Emit Socket.IO event 'market:newCoin' with asset data
    - Return success response with created asset
    - _Requirements: 3.2, 3.3, 3.4, 3.10_
  
  - [~] 3.2 Create PATCH /api/admin/market/:id endpoint (or extend existing)
    - Check if endpoint exists in backend/index.ts, if yes extend it, if no create it
    - Apply requireAuth middleware and check 'market_control' permission
    - Extract asset id from URL params
    - Validate request body: { price?: number, volatility?: number, manipulation?: { direction, duration, unit } }
    - Query CustomAsset by id, return 404 if not found
    - Update price and/or volatility if provided
    - If manipulation provided: update or create Manipulation record
    - Update in-memory assets array
    - Emit Socket.IO event 'market:update' with updated asset data
    - Return success response with updated asset
    - _Requirements: 3.6, 3.9_
  
  - [~] 3.3 Create DELETE /api/admin/market/:id endpoint (or extend existing)
    - Check if endpoint exists in backend/index.ts, if yes extend it, if no create it
    - Apply requireAuth middleware and check 'market_control' permission
    - Extract asset id from URL params
    - Query CustomAsset by id
    - Check isCustom flag, prevent deletion if false (system coins)
    - Delete CustomAsset record from database
    - Delete associated Manipulation record if exists
    - Remove from in-memory assets array
    - Clear any active price update timers for this asset
    - Emit Socket.IO event 'market:coinRemoved' with asset id
    - Return success response
    - _Requirements: 3.7, 3.8_
  
  - [~] 3.4 Create GET /api/admin/market endpoint (or extend existing)
    - Check if endpoint exists in backend/index.ts, if yes extend it, if no create it
    - Apply requireAuth middleware and check 'market_control' permission
    - Query all CustomAsset records
    - Query all active Manipulation records
    - Join manipulation data with assets
    - Calculate remaining time for active manipulations
    - Return response: { assets: CustomAsset[], manipulations: Manipulation[] }
    - _Requirements: 3.5, 3.11_
  
  - [ ]* 3.5 Write unit tests for coin management endpoints
    - Create test file backend/tests/coin-management.test.ts
    - Test POST /api/admin/market/add with valid data (expect 201, asset created)
    - Test POST /api/admin/market/add with duplicate id (expect 400, error)
    - Test POST /api/admin/market/add without permission (expect 403)
    - Test PATCH /api/admin/market/:id updates price and volatility
    - Test DELETE /api/admin/market/:id removes custom asset
    - Test DELETE /api/admin/market/:id prevents deletion of system coins
    - Mock CustomAsset, Manipulation models and Socket.IO
    - _Requirements: 3.3, 3.12_


- [ ] 4. Implement backend API endpoints for user management
  - [~] 4.1 Create GET /api/admin/users endpoint
    - Add route handler in backend/index.ts after admin routes section
    - Apply requireAuth middleware and check 'manage_users' permission using checkPermission()
    - Extract query params: search (string), role (string), page (number, default 1), limit (number, default 50)
    - Build query filter: if search provided, match email or displayName (case-insensitive regex)
    - If role provided, filter by role field
    - Query User model with filter, pagination (skip/limit), sort by createdAt desc
    - Count total matching users for pagination metadata
    - Return response: { users: User[], total: number, page: number, limit: number }
    - _Requirements: 4.2, 4.3_
  
  - [~] 4.2 Create POST /api/admin/users endpoint
    - Add route handler in backend/index.ts
    - Apply requireAuth middleware and check 'manage_users' permission
    - Validate request body: { email: string, password: string, displayName: string, role: string, balance?: number }
    - Check if user already exists (query User by email)
    - Create user in Firebase Authentication using admin.auth().createUser()
    - Create User record in MongoDB with provided data and default permissions based on role
    - Create Wallet record for new user with initial balance
    - Return success response with created user (exclude password)
    - Handle errors: 400 for validation, 409 for duplicate email, 500 for server errors
    - _Requirements: 4.6, 4.7_
  
  - [~] 4.3 Create PUT /api/admin/users/:userId endpoint
    - Add route handler in backend/index.ts
    - Apply requireAuth middleware and check 'manage_users' permission
    - Extract userId from URL params
    - Validate request body: { balance?: number, role?: string, permissions?: string[] }
    - Query User by userId (use _id field)
    - If balance change: calculate difference, create Transaction record (type: 'admin_credit' or 'admin_debit')
    - Update User record with new values
    - Update Wallet record if balance changed
    - Emit Socket.IO event 'admin:userUpdate' with updated user data
    - Return success response with updated user
    - _Requirements: 4.5, 4.8_
  
  - [~] 4.4 Create DELETE /api/admin/users/:userId endpoint
    - Add route handler in backend/index.ts
    - Apply requireAuth middleware and check 'manage_users' permission
    - Extract userId from URL params
    - Query User by userId
    - Prevent deletion if user is owner (check isOwner or role === 'owner')
    - Delete user from Firebase Authentication using admin.auth().deleteUser()
    - Delete User record from MongoDB
    - Cascade delete: Trade records (userId), Transaction records (userId), KYC records (userId), Wallet record (userId)
    - Emit Socket.IO event 'admin:userDeleted' with userId
    - Return success response
    - _Requirements: 4.9, 4.10_
  
  - [~] 4.5 Create POST /api/admin/users/:userId/force-transaction endpoint
    - Add route handler in backend/index.ts
    - Apply requireAuth middleware and check 'manage_users' permission
    - Extract userId from URL params
    - Validate request body: { type: 'deposit' | 'withdrawal', amount: number, reason?: string }
    - Query User by userId
    - If withdrawal: check balance >= amount (prevent negative balance)
    - Update user balance: deposit adds, withdrawal subtracts
    - Create Transaction record with type, amount, metadata: { adminId: req.email, reason }
    - Update Wallet record
    - Return success response with new balance and transaction
    - _Requirements: 4.11_
  
  - [ ]* 4.6 Write unit tests for user management endpoints
    - Create test file backend/tests/user-management.test.ts
    - Test GET /api/admin/users with search and pagination
    - Test POST /api/admin/users creates user and wallet
    - Test POST /api/admin/users with duplicate email (expect 409)
    - Test PUT /api/admin/users/:userId updates balance and creates transaction
    - Test DELETE /api/admin/users/:userId cascades deletes
    - Test DELETE prevents owner deletion
    - Test POST force-transaction with deposit and withdrawal
    - Mock User, Wallet, Transaction, Trade, KYC models and Firebase Admin
    - _Requirements: 4.1, 4.2, 4.8_


- [ ] 5. Implement backend API endpoints for transaction management
  - [~] 5.1 Create GET /api/admin/transactions endpoint
    - Add route handler in backend/index.ts
    - Apply requireAuth middleware and check 'manage_transactions' permission
    - Extract query params: type (string), userId (string), startDate (string), endDate (string), page (number), limit (number, default 100)
    - Build query filter: if type provided, filter by type; if userId provided, filter by userId; if date range, filter by timestamp
    - Query Transaction model with filter, pagination, sort by timestamp desc
    - Calculate statistics: sum amounts by type (deposits, withdrawals), calculate net flow
    - Count total matching transactions
    - Return response: { transactions: Transaction[], total: number, page: number, statistics: { totalDeposits, totalWithdrawals, netFlow } }
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 5.9_
  
  - [~] 5.2 Create GET /api/admin/transactions/export endpoint
    - Add route handler in backend/index.ts
    - Apply requireAuth middleware and check 'manage_transactions' permission
    - Use same query params and filtering as GET /api/admin/transactions
    - Query all matching transactions (no pagination limit)
    - Generate CSV string: headers (ID, User, Type, Amount, Status, Timestamp), then rows
    - Set response headers: Content-Type: text/csv, Content-Disposition: attachment; filename=transactions.csv
    - Stream CSV response using res.send(csvString)
    - _Requirements: 5.8_
  
  - [ ]* 5.3 Write unit tests for transaction management endpoints
    - Create test file backend/tests/transaction-management.test.ts
    - Test GET /api/admin/transactions with no filters (returns all)
    - Test GET /api/admin/transactions with type filter (returns only matching type)
    - Test GET /api/admin/transactions with date range filter
    - Test statistics calculation accuracy (sum deposits, withdrawals, net flow)
    - Test GET /api/admin/transactions/export returns CSV format
    - Test pagination behavior (page 1 vs page 2)
    - Mock Transaction model
    - _Requirements: 5.2, 5.10_

- [ ] 6. Implement backend API endpoints for wallet management
  - [~] 6.1 Create GET /api/admin/wallets endpoint
    - Add route handler in backend/index.ts
    - Apply requireAuth middleware and check 'manage_transactions' permission
    - Extract query params: search (string), status (string), page (number), limit (number, default 50)
    - Build query filter: if search provided, lookup user by email/name first, then filter wallets by userId
    - If status provided, filter by status field
    - Query Wallet model with filter and pagination
    - For each wallet, populate user information (email, displayName) using User model
    - Calculate statistics: sum all balances (totalPlatformBalance), calculate average balance
    - Return response: { wallets: Wallet[], total: number, statistics: { totalPlatformBalance, averageBalance } }
    - _Requirements: 6.2, 6.3, 6.8_
  
  - [~] 6.2 Create POST /api/admin/wallets/:userId/credit endpoint
    - Add route handler in backend/index.ts
    - Apply requireAuth middleware and check 'manage_transactions' permission
    - Extract userId from URL params, admin email from req.email
    - Validate request body: { amount: number, reason?: string }
    - Validate amount > 0
    - Query Wallet by userId
    - Update wallet balance: balance += amount
    - Query User and update balance field
    - Create Transaction record: type 'admin_credit', amount, metadata: { adminId: req.email, reason }
    - Save wallet and user
    - Return success response with new balance and transaction
    - _Requirements: 6.5, 6.7, 6.10_
  
  - [~] 6.3 Create POST /api/admin/wallets/:userId/debit endpoint
    - Add route handler in backend/index.ts
    - Apply requireAuth middleware and check 'manage_transactions' permission
    - Extract userId from URL params, admin email from req.email
    - Validate request body: { amount: number, reason?: string }
    - Validate amount > 0
    - Query Wallet by userId
    - Check wallet.balance >= amount (prevent negative balance)
    - Update wallet balance: balance -= amount
    - Query User and update balance field
    - Create Transaction record: type 'admin_debit', amount: -amount, metadata: { adminId: req.email, reason }
    - Save wallet and user
    - Return success response with new balance and transaction
    - _Requirements: 6.6, 6.7, 6.9, 6.10_
  
  - [~] 6.4 Create POST /api/admin/wallets/:userId/freeze endpoint
    - Add route handler in backend/index.ts
    - Apply requireAuth middleware and check 'manage_admins' permission
    - Extract userId from URL params, admin email from req.email
    - Validate request body: { reason: string }
    - Query Wallet by userId
    - Update wallet: status = 'frozen', freezeReason = reason, freezeBy = req.email, freezeAt = new Date()
    - Save wallet
    - Emit Socket.IO event 'wallet:frozen' with userId and reason
    - Return success response with updated wallet
    - _Requirements: 6.11, 6.12_
  
  - [~] 6.5 Create POST /api/admin/wallets/:userId/unfreeze endpoint
    - Add route handler in backend/index.ts
    - Apply requireAuth middleware and check 'manage_admins' permission
    - Extract userId from URL params
    - Query Wallet by userId
    - Update wallet: status = 'active', freezeReason = undefined, freezeBy = undefined, freezeAt = undefined
    - Save wallet
    - Emit Socket.IO event 'wallet:unfrozen' with userId
    - Return success response with updated wallet
    - _Requirements: 6.12_
  
  - [ ]* 6.6 Write unit tests for wallet management endpoints
    - Create test file backend/tests/wallet-management.test.ts
    - Test GET /api/admin/wallets returns wallets with user info and statistics
    - Test POST /api/admin/wallets/:userId/credit increases balance and creates transaction
    - Test POST /api/admin/wallets/:userId/debit decreases balance with validation
    - Test POST /api/admin/wallets/:userId/debit with insufficient balance (expect 400)
    - Test POST /api/admin/wallets/:userId/freeze updates status and metadata
    - Test POST /api/admin/wallets/:userId/unfreeze clears freeze metadata
    - Mock Wallet, User, Transaction models and Socket.IO
    - _Requirements: 6.4, 6.9_


- [ ] 7. Implement backend API endpoints for settings management
  - [~] 7.1 Create GET /api/admin/settings endpoint
    - Add route handler in backend/index.ts
    - Apply requireAuth middleware and check admin role (role === 'admin' or 'owner')
    - Query PlatformSettings model (single document, use findOne())
    - If no settings exist, return default settings object
    - Return response with all settings sections and metadata
    - _Requirements: 7.2_
  
  - [~] 7.2 Create PUT /api/admin/settings endpoint
    - Add route handler in backend/index.ts
    - Apply requireAuth middleware and check admin role
    - Extract admin email from req.email
    - Validate request body: { section: string, settings: object }
    - Validate settings based on section:
      - trading: minTradeAmount < maxTradeAmount, maxLeverage 1-100, commissionRate 0-1
      - mining: minFee > 0, rewardMultiplier > 0
      - general: platformName non-empty
    - Use findOneAndUpdate with upsert: true to update or create settings document
    - Update specific section using dot notation: { [`${section}.field`]: value }
    - Set lastModified = new Date(), lastModifiedBy = req.email
    - Emit Socket.IO event 'admin:settingsUpdate' with section and updated settings
    - Return success response with updated settings
    - _Requirements: 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_
  
  - [ ]* 7.3 Write unit tests for settings endpoints
    - Create test file backend/tests/settings.test.ts
    - Test GET /api/admin/settings returns settings or defaults
    - Test PUT /api/admin/settings updates specific section
    - Test PUT /api/admin/settings with invalid data (expect 400)
    - Test PUT /api/admin/settings updates lastModified metadata
    - Test PUT /api/admin/settings without admin role (expect 403)
    - Mock PlatformSettings model and Socket.IO
    - _Requirements: 7.8_

- [~] 8. Checkpoint - Backend API implementation complete
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 9. Create enhanced Dashboard component
  - [~] 9.1 Create Dashboard component structure and layout
    - Update existing Dashboard.tsx in trass/src/components or create new version
    - Implement header with search bar and user profile icon using existing patterns
    - Implement responsive grid layout for stats and features using Tailwind CSS
    - Add bottom navigation bar with Home, Markets, Trade, Activity, Assets tabs
    - Use existing color scheme and typography from index.css
    - _Requirements: 1.2, 1.8, 1.9, 1.11, 10.1, 10.2, 10.3_
  
  - [~] 9.2 Implement dashboard stats section
    - Create stats cards for Total Balance, Active Trades, Win Rate, Account Tier
    - Display balance in USDT with prominent typography (text-4xl font-bold)
    - Fetch user data from /api/users/:email endpoint
    - Calculate stats from trades and transactions using existing API endpoints
    - Add loading states with skeleton components and error handling with toast notifications
    - _Requirements: 1.3, 1.10_
  
  - [~] 9.3 Implement feature buttons grid
    - Create feature button components for Deposit, Invest Plan, New Coin, Loan, Mining, NFT, Stocks, Gift, Recovery
    - Add icons using Lucide React (already in dependencies)
    - Implement navigation handlers using React Router's useNavigate hook
    - Add hover and active states with Framer Motion animations (already in dependencies)
    - Ensure touch targets are at least 44x44 pixels (min-h-11 min-w-11)
    - _Requirements: 1.5, 1.12, 10.4, 10.10_
  
  - [~] 9.4 Implement asset price list section
    - Create asset price card components with responsive design
    - Display Bitcoin, Ethereum, Solana, Gold, Dogecoin with current prices
    - Show 24-hour percentage change with color indicators (text-green-500/text-red-500)
    - Fetch real-time prices from existing backend assets array
    - Subscribe to Socket.IO 'price_update' event for real-time updates
    - Make horizontally scrollable on mobile devices (overflow-x-auto)
    - _Requirements: 1.7, 10.5_
  
  - [~] 9.5 Implement news/announcement section
    - Create news card component with image and text layout
    - Add placeholder content for platform announcements
    - Implement responsive layout for mobile (stack) and desktop (side-by-side)
    - Use existing card styling patterns from other components
    - _Requirements: 1.6_
  
  - [~] 9.6 Implement portfolio performance chart
    - Use Recharts (already in dependencies) to create 7-day performance line chart
    - Fetch historical balance data from transactions endpoint
    - Calculate daily balance snapshots from transaction history
    - Add responsive chart sizing for different screen sizes (h-64 on mobile, h-80 on desktop)
    - Style chart with existing color scheme (primary blue, success green)
    - _Requirements: 1.3, 10.1, 10.2, 10.3_
  
  - [~] 9.7 Update authentication flow to redirect to Dashboard
    - Modify AuthPage.tsx to redirect to /dashboard after successful registration/login
    - Update App.tsx routing to include Dashboard route with authentication guard
    - Ensure authentication state persists across page refreshes using Firebase onAuthStateChanged
    - Add loading state while checking authentication status
    - _Requirements: 1.1_
  
  - [ ]* 9.8 Write unit tests for Dashboard component
    - Test component renders with user data using React Testing Library
    - Test feature button navigation with mocked useNavigate
    - Test price updates via WebSocket with mocked Socket.IO client
    - Test responsive layout behavior with different viewport sizes
    - Mock API calls using jest.mock and WebSocket connections
    - _Requirements: 1.11, 10.12_


- [ ] 10. Create Mining component and interface
  - [~] 10.1 Create Mining component structure
    - Create new Mining.tsx component file in trass/src/components
    - Implement responsive layout for mobile and desktop using Tailwind CSS
    - Add navigation back to dashboard using React Router Link component
    - Use existing color scheme and component patterns from Dashboard
    - Add header with mining icon and title
    - _Requirements: 2.1, 2.11, 10.7_
  
  - [~] 10.2 Implement mining option selection interface
    - Create mining option cards for Bitcoin, Ethereum, Solana, Litecoin, Dogecoin
    - Display mining difficulty (easy/medium/hard), estimated rewards, time requirements for each option
    - Add selection state management using useState hook
    - Implement responsive grid layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
    - Style selected card with border highlight and background color change
    - _Requirements: 2.2, 2.3, 2.4_
  
  - [~] 10.3 Implement mining initiation logic
    - Add "Start Mining" button with balance validation
    - Call POST /api/mining/start endpoint with selected coin and user email
    - Deduct mining fee from displayed balance optimistically
    - Handle insufficient balance error with toast notification
    - Prevent multiple concurrent mining operations by checking active session
    - Disable start button while mining is active
    - _Requirements: 2.5, 2.9, 2.10_
  
  - [~] 10.4 Implement mining progress display
    - Create progress bar component with percentage display using Tailwind width classes
    - Show estimated completion time countdown using setInterval
    - Display current mining status (active/completed/failed) with status badges
    - Subscribe to Socket.IO 'mining:progress' events in useEffect
    - Update progress bar in real-time based on event data
    - Add animated progress bar transition
    - _Requirements: 2.6, 2.11_
  
  - [~] 10.5 Implement mining completion handling
    - Subscribe to Socket.IO 'mining:complete' event in useEffect
    - Display completion notification with reward amount using toast
    - Update user balance with earned cryptocurrency
    - Add mining session to history display automatically
    - Play success animation using Framer Motion
    - _Requirements: 2.7, 2.8_
  
  - [~] 10.6 Implement mining history display
    - Create mining history table/list component with responsive design
    - Display start time, end time, cryptocurrency mined, rewards earned columns
    - Fetch mining history from GET /api/mining/status/:userId endpoint
    - Add pagination for long history lists (10 items per page)
    - Format dates using date-fns library
    - _Requirements: 2.8_
  
  - [~] 10.7 Implement mining state persistence
    - Save mining state to localStorage on progress updates
    - Restore mining state on component mount using useEffect
    - Handle page refresh during active mining by checking localStorage
    - Reconnect to Socket.IO and resume progress updates
    - Clear localStorage on mining completion
    - _Requirements: 2.12_
  
  - [ ]* 10.8 Write unit tests for Mining component
    - Test mining option selection updates state correctly
    - Test balance validation prevents mining with insufficient funds
    - Test progress updates from WebSocket events
    - Test completion handling updates balance and history
    - Test state persistence and recovery after page refresh
    - Mock API calls using jest.mock and WebSocket connections
    - _Requirements: 2.11, 2.12_



- [ ] 11. Create Admin Panel components for coin management
  - [~] 11.1 Create CoinManagement component structure
    - Create new CoinManagement.tsx component file in trass/src/components
    - Implement responsive layout with table/card view toggle
    - Add navigation and breadcrumb using existing AdminPanel patterns
    - Use Tailwind CSS matching existing admin panel design
    - Add header with "Coin Management" title and "Add Coin" button
    - _Requirements: 3.1, 3.12_
  
  - [~] 11.2 Implement coin listing display
    - Create coin table with columns for symbol, name, price, volatility, type, custom flag
    - Display manipulation status with visual indicators (badges with colors)
    - Add sorting and filtering capabilities using state management
    - Fetch coins from GET /api/admin/market endpoint (existing)
    - Use existing table styling patterns from AdminPanel
    - _Requirements: 3.5, 3.11_
  
  - [~] 11.3 Implement add coin form
    - Create modal form for adding new coins using existing modal patterns
    - Add input fields for symbol, name, price, volatility, type (crypto/commodity/stock)
    - Add optional manipulation controls section (direction, duration, unit)
    - Implement form validation with error messages using react-hook-form
    - Call POST /api/admin/market/add endpoint (existing) on submit
    - Add x-user-email header with admin email for permission check
    - _Requirements: 3.2, 3.3, 3.4, 3.10_
  
  - [~] 11.4 Implement edit coin functionality
    - Create modal form for editing existing coins
    - Pre-populate form with current coin data
    - Allow editing price, volatility, and manipulation parameters
    - Call PATCH /api/admin/market/:id endpoint (existing) on submit
    - Add x-user-email header with admin email for permission check
    - _Requirements: 3.6, 3.9_
  
  - [~] 11.5 Implement delete coin functionality
    - Add delete button with confirmation dialog using existing modal patterns
    - Prevent deletion of system/default coins (check isCustom flag)
    - Call DELETE /api/admin/market/:id endpoint (existing)
    - Update UI after successful deletion by refetching coin list
    - Show success toast notification
    - _Requirements: 3.7, 3.8_
  
  - [ ]* 11.6 Write unit tests for CoinManagement component
    - Test coin listing display renders correctly
    - Test add coin form validation and submission
    - Test edit coin functionality updates data
    - Test delete coin with confirmation dialog
    - Mock API calls using jest.mock
    - _Requirements: 3.12_


- [ ] 12. Create Admin Panel components for user management
  - [~] 12.1 Create UserManagement component structure
    - Create new UserManagement.tsx component file in src/components
    - Implement responsive layout with table view
    - Add search bar and filter controls
    - Use Tailwind CSS matching existing admin panel design
    - _Requirements: 4.1, 4.2_
  
  - [~] 12.2 Implement user listing display
    - Create user table with columns for email, name, balance, role, registration date
    - Add pagination controls
    - Implement search functionality
    - Fetch users from GET /api/admin/users endpoint
    - _Requirements: 4.2, 4.3_
  
  - [~] 12.3 Implement user detail view
    - Create modal or side panel for detailed user information
    - Display trade history and transaction history
    - Show user statistics (total trades, win rate, account status)
    - _Requirements: 4.4, 4.12_
  
  - [~] 12.4 Implement create user form
    - Create modal form for creating new users
    - Add input fields for email, password, display name, role, initial balance
    - Implement form validation
    - Call POST /api/admin/users endpoint on submit
    - _Requirements: 4.6, 4.7_
  
  - [~] 12.5 Implement edit user functionality
    - Create modal form for editing user data
    - Allow balance adjustment, role change, permission updates
    - Call PUT /api/admin/users/:userId endpoint on submit
    - _Requirements: 4.5, 4.8_
  
  - [~] 12.6 Implement delete user functionality
    - Add delete button with confirmation dialog
    - Display warning about cascade deletion
    - Call DELETE /api/admin/users/:userId endpoint
    - _Requirements: 4.9, 4.10_
  
  - [~] 12.7 Implement force transaction functionality
    - Add force deposit and force withdrawal buttons
    - Create modal form for transaction details
    - Call POST /api/admin/users/:userId/force-transaction endpoint
    - _Requirements: 4.11_
  
  - [ ]* 12.8 Write unit tests for UserManagement component
    - Test user listing and search
    - Test create user form
    - Test edit user functionality
    - Test delete user with confirmation
    - Test force transaction operations
    - Mock API calls
    - _Requirements: 4.1, 4.2_


- [ ] 13. Create Admin Panel components for transaction management
  - [~] 13.1 Create TransactionManagement component structure
    - Create new TransactionManagement.tsx component file in src/components
    - Implement responsive layout with table view
    - Add filter controls and date range picker
    - Use Tailwind CSS matching existing admin panel design
    - _Requirements: 5.1_
  
  - [~] 13.2 Implement transaction listing display
    - Create transaction table with columns for type, amount, user, status, timestamp
    - Add pagination controls
    - Implement filtering by type, user, date range
    - Fetch transactions from GET /api/admin/transactions endpoint
    - Sort by timestamp descending
    - _Requirements: 5.2, 5.3, 5.4, 5.9_
  
  - [~] 13.3 Implement transaction statistics display
    - Create statistics cards for total deposits, withdrawals, net flow
    - Display transaction trends chart using Recharts
    - Calculate statistics from transaction data
    - _Requirements: 5.5, 5.6, 5.12_
  
  - [~] 13.4 Implement transaction export functionality
    - Add export button to download CSV
    - Call GET /api/admin/transactions/export endpoint
    - Handle file download in browser
    - _Requirements: 5.8_
  
  - [~] 13.5 Implement auto-refresh functionality
    - Set up interval to refresh transaction data every 15 seconds
    - Add manual refresh button
    - Display last updated timestamp
    - _Requirements: 5.11_
  
  - [ ]* 13.6 Write unit tests for TransactionManagement component
    - Test transaction listing and filtering
    - Test statistics calculation
    - Test export functionality
    - Test auto-refresh behavior
    - Mock API calls
    - _Requirements: 5.10_


- [ ] 14. Create Admin Panel components for wallet management
  - [~] 14.1 Create WalletManagement component structure
    - Create new WalletManagement.tsx component file in src/components
    - Implement responsive layout with table view
    - Add search bar and filter controls
    - Use Tailwind CSS matching existing admin panel design
    - _Requirements: 6.1_
  
  - [~] 14.2 Implement wallet listing display
    - Create wallet table with columns for user, balance, frozen balance, status, last activity
    - Add pagination controls
    - Implement search functionality
    - Fetch wallets from GET /api/admin/wallets endpoint
    - _Requirements: 6.2, 6.3_
  
  - [~] 14.3 Implement wallet statistics display
    - Create statistics cards for total platform balance, average balance
    - Calculate statistics from wallet data
    - _Requirements: 6.8_
  
  - [~] 14.4 Implement wallet credit functionality
    - Add credit button for each wallet
    - Create modal form for credit amount and reason
    - Call POST /api/admin/wallets/:userId/credit endpoint
    - Update wallet display after successful credit
    - _Requirements: 6.5, 6.7, 6.10_
  
  - [~] 14.5 Implement wallet debit functionality
    - Add debit button for each wallet
    - Create modal form for debit amount and reason
    - Validate debit amount against current balance
    - Call POST /api/admin/wallets/:userId/debit endpoint
    - Update wallet display after successful debit
    - _Requirements: 6.6, 6.7, 6.9, 6.10_
  
  - [~] 14.6 Implement wallet freeze/unfreeze functionality
    - Add freeze/unfreeze toggle for each wallet
    - Create modal form for freeze reason
    - Call POST /api/admin/wallets/:userId/freeze or unfreeze endpoint
    - Display freeze status with visual indicators
    - _Requirements: 6.11, 6.12_
  
  - [ ]* 14.7 Write unit tests for WalletManagement component
    - Test wallet listing and search
    - Test credit functionality
    - Test debit functionality with validation
    - Test freeze/unfreeze operations
    - Mock API calls
    - _Requirements: 6.4_


- [ ] 15. Create Admin Panel Settings component
  - [~] 15.1 Create Settings component structure
    - Create new Settings.tsx component file in src/components
    - Implement responsive layout with section tabs or accordion
    - Add save and reset buttons
    - Use Tailwind CSS matching existing admin panel design
    - _Requirements: 7.1, 7.12_
  
  - [~] 15.2 Implement General settings section
    - Create form fields for platform name, maintenance mode, registration enabled
    - Fetch current settings from GET /api/admin/settings endpoint
    - _Requirements: 7.2_
  
  - [~] 15.3 Implement Trading settings section
    - Create form fields for min/max trade amount, max leverage, commission rate
    - Add validation for min < max and valid ranges
    - _Requirements: 7.3, 7.5_
  
  - [~] 15.4 Implement Binary trading duration settings
    - Create list of current duration options
    - Add functionality to add, edit, and delete duration options
    - _Requirements: 7.3, 7.4_
  
  - [~] 15.5 Implement Mining settings section
    - Create form fields for mining enabled, min fee, reward multiplier, available coins
    - Add validation for positive values
    - _Requirements: 7.6_
  
  - [~] 15.6 Implement KYC settings section
    - Create form fields for KYC required, auto-approve, required documents
    - _Requirements: 7.7_
  
  - [~] 15.7 Implement settings save functionality
    - Call PUT /api/admin/settings endpoint with updated settings
    - Display success/error messages
    - Update last modified metadata display
    - _Requirements: 7.8, 7.9, 7.10_
  
  - [~] 15.8 Implement reset to defaults functionality
    - Add reset button for each section
    - Confirm before resetting
    - Restore default values for selected section
    - _Requirements: 7.11_
  
  - [ ]* 15.9 Write unit tests for Settings component
    - Test settings display
    - Test form validation
    - Test save functionality
    - Test reset functionality
    - Mock API calls
    - _Requirements: 7.8_


- [ ] 16. Update AdminPanel component routing
  - [~] 16.1 Add routes for new admin modules
    - Update AdminPanel.tsx in trass/src/components to include routes for CoinManagement, UserManagement, TransactionManagement, WalletManagement, Settings
    - Add navigation menu items for new modules in sidebar
    - Implement permission-based route guards using checkPermission helper
    - Use React Router's Routes and Route components for routing
    - Add lazy loading for admin components using React.lazy
    - _Requirements: 3.1, 4.1, 5.1, 6.1, 7.1_
  
  - [~] 16.2 Update admin navigation menu
    - Add menu items with icons for new modules (Coins, Users, Transactions, Wallets, Settings)
    - Implement active state highlighting using useLocation hook
    - Add permission checks to hide/show menu items based on user role
    - Use existing navigation styling patterns from AdminPanel
    - Add tooltips for menu items on hover
    - _Requirements: 4.1, 5.1, 6.1_


- [ ] 17. Implement WebSocket event handlers
  - [~] 17.1 Set up Socket.IO client connection
    - Initialize Socket.IO client in main App.tsx component using io() from socket.io-client
    - Handle connection and disconnection events with console logging
    - Implement reconnection logic with exponential backoff
    - Store socket instance in React context for global access
    - Add connection status indicator in UI
    - _Requirements: 2.6, 2.12_
  
  - [~] 17.2 Implement mining event handlers
    - Subscribe to 'mining:progress' events in Mining component useEffect
    - Subscribe to 'mining:complete' events in Mining component useEffect
    - Subscribe to 'mining:error' events in Mining component useEffect
    - Update Mining component state on events (progress, status, error message)
    - Clean up event listeners on component unmount
    - _Requirements: 2.6, 2.7, 2.12_
  
  - [~] 17.3 Implement market event handlers
    - Subscribe to 'price_update' events (existing) in Dashboard component useEffect
    - Subscribe to 'market:newCoin' events in Dashboard and CoinManagement components
    - Subscribe to 'market:coinRemoved' events in Dashboard and CoinManagement components
    - Update Dashboard and CoinManagement components state on events
    - Refresh asset price list and coin management table on events
    - _Requirements: 1.7, 3.8, 3.10_
  
  - [~] 17.4 Implement admin event handlers
    - Subscribe to 'admin:userUpdate' events in UserManagement component useEffect
    - Subscribe to 'admin:transactionNew' events in TransactionManagement component useEffect
    - Subscribe to 'admin:settingsUpdate' events in Settings component useEffect
    - Update relevant admin components state on events
    - Refresh data tables automatically on events
    - _Requirements: 4.8, 5.11, 7.9_


- [~] 18. Final checkpoint - Integration and testing
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 19. Code review and deployment preparation
  - [~] 19.1 Review all code changes
    - Verify all components follow existing patterns
    - Check TypeScript types and interfaces
    - Verify error handling is consistent
    - Review responsive design implementation
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9_
  
  - [~] 19.2 Test responsive design
    - Test on mobile devices (320px-768px)
    - Test on tablet devices (768px-1024px)
    - Test on desktop devices (>1024px)
    - Verify touch targets are at least 44x44 pixels
    - Test on iOS Safari, Android Chrome, desktop browsers
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10, 10.11, 10.12_
  
  - [~] 19.3 Prepare Git commit and push
    - Stage all modified files
    - Create descriptive commit message
    - Commit changes to local repository
    - Push to GitHub repository
    - Verify Netlify deployment
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10_

## Notes

### Task Execution Guidelines
- Tasks marked with `*` are optional test-related sub-tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability back to the requirements document
- Checkpoints are included at strategic points to ensure incremental validation and allow for user feedback
- The implementation follows a logical progression: backend data models → backend API endpoints → frontend components → integration

### Testing Strategy
- Property-based testing is not applicable to this feature as it focuses on UI rendering, CRUD operations, and side-effect heavy operations
- Unit tests and integration tests are included as optional sub-tasks
- Manual testing should be performed for responsive design and cross-browser compatibility

### Implementation Guidelines
- **Language:** All code must be written in TypeScript with proper type annotations
- **Design System:** Follow existing Tailwind CSS classes and component patterns
- **Code Patterns:** Match existing project structure, naming conventions, and architectural patterns
- **Error Handling:** Provide user-friendly error messages without exposing internal details
- **Validation:** Implement both client-side and server-side validation for all user inputs

### Feature-Specific Notes
- **WebSocket Integration:** Critical for real-time updates in mining progress and market data
- **Mining System:** Uses simulated mining, not real blockchain operations
- **Admin Components:** Require permission checks to ensure proper access control
- **Sensitive Operations:** User deletion, wallet freeze, and balance adjustments require confirmation dialogs
- **Database Operations:** Use transactions where appropriate to ensure data consistency and atomicity
- **Responsive Design:** Test on mobile (320px-768px), tablet (768px-1024px), and desktop (>1024px) throughout development

### File Locations
- **Frontend Components:** `d:\tardsss\trass\src\components\`
- **Backend Routes:** `d:\tardsss\backend\` (index.ts for routes)
- **Data Models:** `d:\tardsss\backend\models.ts`
- **Existing Components:** Dashboard.tsx, AdminPanel.tsx, AuthPage.tsx already exist and may need updates

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1.1", "1.2", "1.3", "1.4", "1.5"]
    },
    {
      "id": 1,
      "tasks": ["2.1", "3.1", "4.1", "5.1", "6.1", "7.1"]
    },
    {
      "id": 2,
      "tasks": ["2.2", "2.3", "3.2", "3.3", "4.2", "4.3", "5.2", "6.2", "6.3", "7.2"]
    },
    {
      "id": 3,
      "tasks": ["2.4", "3.4", "4.4", "4.5", "6.4", "6.5"]
    },
    {
      "id": 4,
      "tasks": ["2.5", "3.5", "4.6", "5.3", "6.6", "7.3"]
    },
    {
      "id": 5,
      "tasks": ["9.1", "10.1", "11.1", "12.1", "13.1", "14.1", "15.1"]
    },
    {
      "id": 6,
      "tasks": ["9.2", "9.3", "10.2", "11.2", "12.2", "13.2", "14.2", "15.2"]
    },
    {
      "id": 7,
      "tasks": ["9.4", "9.5", "10.3", "11.3", "12.3", "13.3", "14.3", "15.3", "15.4"]
    },
    {
      "id": 8,
      "tasks": ["9.6", "10.4", "11.4", "12.4", "13.4", "14.4", "15.5", "15.6"]
    },
    {
      "id": 9,
      "tasks": ["9.7", "10.5", "11.5", "12.5", "13.5", "14.5", "15.7", "15.8"]
    },
    {
      "id": 10,
      "tasks": ["10.6", "10.7", "12.6", "12.7", "14.6", "16.1", "16.2"]
    },
    {
      "id": 11,
      "tasks": ["17.1"]
    },
    {
      "id": 12,
      "tasks": ["17.2", "17.3", "17.4"]
    },
    {
      "id": 13,
      "tasks": ["9.8", "10.8", "11.6", "12.8", "13.6", "14.7", "15.9"]
    },
    {
      "id": 14,
      "tasks": ["19.1", "19.2"]
    },
    {
      "id": 15,
      "tasks": ["19.3"]
    }
  ]
}
```
