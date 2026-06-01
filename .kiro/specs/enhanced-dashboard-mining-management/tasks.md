# Implementation Plan: Enhanced Dashboard, Mining Management, and Admin Features

## Overview

This implementation plan breaks down the development of the enhanced trading platform into discrete, incremental coding tasks. The plan follows a logical progression: first establishing the data models and backend infrastructure, then implementing the dashboard and mining features, and finally extending the admin panel with comprehensive management modules. Each task builds on previous work and includes specific requirements references for traceability.

**Implementation Language:** TypeScript (as specified in the design document)
- Frontend: React 18 with TypeScript
- Backend: Node.js/Express with TypeScript
- All code examples and implementations will use TypeScript syntax and type safety features

## Tasks

- [ ] 1. Set up data models and database schema
  - [ ] 1.1 Create MiningSession model in backend
    - Add MiningSession schema to backend/models.ts
    - Define TypeScript interface and Mongoose schema for mining sessions
    - Add validation for duration (5-1440 minutes), fee (positive), progress (0-100)
    - Create indexes on userId, status, and startTime fields
    - Integrate with smart model proxy for MongoDB/JSON fallback
    - _Requirements: 2.8, 2.12_
  
  - [ ] 1.2 Create Coin model with custom coin support
    - Extend existing CustomAsset model in backend/models.ts to support coin-specific fields
    - Add TypeScript interface for Coin with symbol, name, price, volatility, type, isCustom
    - Add validation for symbol (2-10 uppercase alphanumeric), price (positive), volatility (0.01-0.5)
    - Ensure unique index on symbol/id field
    - Extend MarketManipulation schema with validation for strength (1-10) and duration
    - _Requirements: 3.2, 3.3, 3.4_
  
  - [ ] 1.3 Extend Transaction model with new transaction types
    - Update transactionSchema in backend/models.ts
    - Add 'mining_fee', 'mining_reward', 'admin_credit', 'admin_debit' to transaction type enum
    - Add optional metadata field for coinSymbol, miningSessionId, adminId, reason
    - Add balanceBefore and balanceAfter fields for audit trail
    - Update validation to ensure balanceAfter = balanceBefore ± amount
    - _Requirements: 2.8, 4.11, 6.7_
  
  - [ ] 1.4 Create Wallet model for wallet management
    - Add walletSchema to backend/models.ts
    - Define TypeScript interface and Mongoose schema for wallets
    - Add fields for userId (unique), balance, frozenBalance, status, freezeReason, freezeBy, freezeAt, lastActivity
    - Create unique index on userId field
    - Add validation to ensure balance >= 0 and frozenBalance >= 0
    - Integrate with smart model proxy for MongoDB/JSON fallback
    - _Requirements: 6.2, 6.9, 6.11, 6.12_
  
  - [ ] 1.5 Create PlatformSettings model
    - Add platformSettingsSchema to backend/models.ts
    - Define TypeScript interface for all settings sections (general, trading, mining, kyc, notifications)
    - Create Mongoose schema with nested objects for each section
    - Add validation for minTradeAmount < maxTradeAmount, maxLeverage (1-100), commissionRate (0-1)
    - Implement single-document pattern with upsert operations
    - Add lastModified and lastModifiedBy fields for audit trail
    - _Requirements: 7.3, 7.4, 7.5, 7.6, 7.7_


- [ ] 2. Implement backend API endpoints for mining system
  - [ ] 2.1 Create POST /api/mining/start endpoint
    - Add route handler in backend/index.ts with requireAuth middleware
    - Validate user balance against mining fee using User model
    - Create mining session record in MongoDB using MiningSession model
    - Deduct mining fee and create transaction record with type 'mining_fee'
    - Start background timer using setTimeout for mining completion
    - Return mining session data to client with success status
    - _Requirements: 2.3, 2.5, 2.10_
  
  - [ ] 2.2 Create GET /api/mining/status/:userId endpoint
    - Add route handler in backend/index.ts with requireAuth middleware
    - Query active mining session for user from MiningSession model
    - Query mining history with pagination (limit 50, sort by startTime desc)
    - Return active session and history array with user balance
    - _Requirements: 2.2, 2.8_
  
  - [ ] 2.3 Create POST /api/mining/complete endpoint
    - Add automatic completion handler in backend/index.ts
    - Calculate actual reward based on difficulty and duration
    - Credit reward to user balance and create transaction record with type 'mining_reward'
    - Update mining session status to 'completed' and set actualReward
    - Emit Socket.IO event 'mining:complete' with session data
    - _Requirements: 2.7, 2.8_
  
  - [ ] 2.4 Implement mining progress WebSocket events
    - Set up Socket.IO event emitters for 'mining:progress' in backend/index.ts
    - Emit progress updates every 10 seconds during active mining using setInterval
    - Calculate progress percentage based on elapsed time: (elapsed / duration) * 100
    - Handle client disconnection and reconnection with session recovery
    - Update MiningSession progress field in database on each emit
    - _Requirements: 2.6, 2.12_
  
  - [ ]* 2.5 Write unit tests for mining endpoints
    - Test start endpoint with sufficient/insufficient balance scenarios
    - Test status endpoint returns correct active session and history
    - Test complete endpoint calculates rewards correctly based on difficulty
    - Test concurrent mining prevention (one active session per user)
    - Mock database operations and WebSocket connections using jest
    - _Requirements: 2.9, 2.10_


- [ ] 3. Implement backend API endpoints for coin management
  - [ ] 3.1 Create POST /api/admin/coins endpoint
    - Implement route handler with admin authentication middleware
    - Validate coin symbol uniqueness
    - Validate price, volatility, and manipulation parameters
    - Create coin record in MongoDB and Firestore
    - Emit WebSocket event for new coin
    - _Requirements: 3.2, 3.3, 3.4, 3.10_
  
  - [ ] 3.2 Create PUT /api/admin/coins/:symbol endpoint
    - Implement route handler with admin authentication middleware
    - Validate updated price and volatility values
    - Update coin record in MongoDB and Firestore
    - Emit WebSocket event for coin update
    - _Requirements: 3.6, 3.9_
  
  - [ ] 3.3 Create DELETE /api/admin/coins/:symbol endpoint
    - Implement route handler with admin authentication middleware
    - Prevent deletion of default/system coins
    - Remove coin from MongoDB and Firestore
    - Stop price update timers for deleted coin
    - Emit WebSocket event for coin removal
    - _Requirements: 3.7, 3.8_
  
  - [ ] 3.4 Create GET /api/admin/coins endpoint
    - Implement route handler with admin authentication middleware
    - Query all coins with custom coin flag
    - Return coin list with manipulation status
    - Include active manipulation remaining time
    - _Requirements: 3.5, 3.11_
  
  - [ ]* 3.5 Write unit tests for coin management endpoints
    - Test coin creation with valid/invalid data
    - Test coin update with price and volatility changes
    - Test coin deletion and cascade effects
    - Test manipulation controls
    - Mock database and WebSocket connections
    - _Requirements: 3.3, 3.12_


- [ ] 4. Implement backend API endpoints for user management
  - [ ] 4.1 Create GET /api/admin/users endpoint
    - Implement route handler with manage_users permission check
    - Add query parameter support for search, role, page, limit
    - Query users with filtering and pagination
    - Return user list with total count and page info
    - _Requirements: 4.2, 4.3_
  
  - [ ] 4.2 Create POST /api/admin/users endpoint
    - Implement route handler with manage_users permission check
    - Validate email, password, displayName, role, balance
    - Create user in Firebase Authentication
    - Create user record in MongoDB with initial balance
    - Create wallet record for new user
    - _Requirements: 4.6, 4.7_
  
  - [ ] 4.3 Create PUT /api/admin/users/:userId endpoint
    - Implement route handler with manage_users permission check
    - Support balance adjustment, role change, permission updates
    - Create transaction record for balance changes
    - Update user record in MongoDB and Firebase
    - Emit WebSocket event for user update
    - _Requirements: 4.5, 4.8_
  
  - [ ] 4.4 Create DELETE /api/admin/users/:userId endpoint
    - Implement route handler with manage_users permission check
    - Add confirmation requirement for destructive operation
    - Delete user from Firebase Authentication
    - Delete user record and cascade delete trades, transactions, KYC records
    - Emit WebSocket event for user deletion
    - _Requirements: 4.9, 4.10_
  
  - [ ] 4.5 Create POST /api/admin/users/:userId/force-transaction endpoint
    - Implement route handler with manage_users permission check
    - Support force deposit and force withdrawal operations
    - Update user balance and create transaction record
    - Validate balance for withdrawals (prevent negative)
    - _Requirements: 4.11_
  
  - [ ]* 4.6 Write unit tests for user management endpoints
    - Test user creation with valid/invalid data
    - Test user update with balance and role changes
    - Test user deletion and cascade effects
    - Test force transaction operations
    - Test permission enforcement
    - _Requirements: 4.1, 4.2, 4.8_


- [ ] 5. Implement backend API endpoints for transaction management
  - [ ] 5.1 Create GET /api/admin/transactions endpoint
    - Implement route handler with manage_transactions permission check
    - Add query parameter support for type, userId, startDate, endDate, page, limit
    - Query transactions with filtering and pagination
    - Calculate transaction statistics (total deposits, withdrawals, net flow)
    - Return transactions with statistics object
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 5.9_
  
  - [ ] 5.2 Create GET /api/admin/transactions/export endpoint
    - Implement route handler with manage_transactions permission check
    - Support same filtering as GET /api/admin/transactions
    - Generate CSV file with transaction data
    - Stream CSV response with appropriate headers
    - _Requirements: 5.8_
  
  - [ ]* 5.3 Write unit tests for transaction management endpoints
    - Test transaction query with various filters
    - Test statistics calculation accuracy
    - Test CSV export format and content
    - Test pagination behavior
    - _Requirements: 5.2, 5.10_

- [ ] 6. Implement backend API endpoints for wallet management
  - [ ] 6.1 Create GET /api/admin/wallets endpoint
    - Implement route handler with manage_transactions permission check
    - Add query parameter support for search, status, page, limit
    - Query wallets with user information joined
    - Calculate wallet statistics (total platform balance, average balance)
    - Return wallets with statistics object
    - _Requirements: 6.2, 6.3, 6.8_
  
  - [ ] 6.2 Create POST /api/admin/wallets/:userId/credit endpoint
    - Implement route handler with manage_transactions permission check
    - Validate credit amount (must be positive)
    - Update wallet balance
    - Create transaction record with admin_credit type
    - Log operation with admin ID and timestamp
    - _Requirements: 6.5, 6.7, 6.10_
  
  - [ ] 6.3 Create POST /api/admin/wallets/:userId/debit endpoint
    - Implement route handler with manage_transactions permission check
    - Validate debit amount (must be positive and <= balance)
    - Update wallet balance with negative balance prevention
    - Create transaction record with admin_debit type
    - Log operation with admin ID and timestamp
    - _Requirements: 6.6, 6.7, 6.9, 6.10_
  
  - [ ] 6.4 Create POST /api/admin/wallets/:userId/freeze endpoint
    - Implement route handler with manage_admins permission check
    - Update wallet status to 'frozen'
    - Record freeze reason, admin ID, and timestamp
    - Emit WebSocket event for wallet freeze
    - _Requirements: 6.11, 6.12_
  
  - [ ] 6.5 Create POST /api/admin/wallets/:userId/unfreeze endpoint
    - Implement route handler with manage_admins permission check
    - Update wallet status to 'active'
    - Clear freeze metadata
    - Emit WebSocket event for wallet unfreeze
    - _Requirements: 6.12_
  
  - [ ]* 6.6 Write unit tests for wallet management endpoints
    - Test wallet query and statistics calculation
    - Test credit operation with transaction creation
    - Test debit operation with balance validation
    - Test freeze/unfreeze operations
    - Test permission enforcement
    - _Requirements: 6.4, 6.9_


- [ ] 7. Implement backend API endpoints for settings management
  - [ ] 7.1 Create GET /api/admin/settings endpoint
    - Implement route handler with admin authentication middleware
    - Query platform settings document from MongoDB
    - Return all settings sections with last modified metadata
    - _Requirements: 7.2_
  
  - [ ] 7.2 Create PUT /api/admin/settings endpoint
    - Implement route handler with admin authentication middleware
    - Validate settings based on section (general, trading, mining, kyc, notifications)
    - Update settings document with partial update support
    - Record last modified timestamp and admin ID
    - Emit WebSocket event for settings update
    - _Requirements: 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_
  
  - [ ]* 7.3 Write unit tests for settings endpoints
    - Test settings retrieval
    - Test settings update with validation
    - Test invalid settings rejection
    - Test last modified tracking
    - _Requirements: 7.8_

- [ ] 8. Checkpoint - Backend API implementation complete
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 9. Create enhanced Dashboard component
  - [ ] 9.1 Create Dashboard component structure and layout
    - Update existing Dashboard.tsx in trass/src/components or create new version
    - Implement header with search bar and user profile icon using existing patterns
    - Implement responsive grid layout for stats and features using Tailwind CSS
    - Add bottom navigation bar with Home, Markets, Trade, Activity, Assets tabs
    - Use existing color scheme and typography from index.css
    - _Requirements: 1.2, 1.8, 1.9, 1.11, 10.1, 10.2, 10.3_
  
  - [ ] 9.2 Implement dashboard stats section
    - Create stats cards for Total Balance, Active Trades, Win Rate, Account Tier
    - Display balance in USDT with prominent typography (text-4xl font-bold)
    - Fetch user data from /api/users/:email endpoint
    - Calculate stats from trades and transactions using existing API endpoints
    - Add loading states with skeleton components and error handling with toast notifications
    - _Requirements: 1.3, 1.10_
  
  - [ ] 9.3 Implement feature buttons grid
    - Create feature button components for Deposit, Invest Plan, New Coin, Loan, Mining, NFT, Stocks, Gift, Recovery
    - Add icons using Lucide React (already in dependencies)
    - Implement navigation handlers using React Router's useNavigate hook
    - Add hover and active states with Framer Motion animations (already in dependencies)
    - Ensure touch targets are at least 44x44 pixels (min-h-11 min-w-11)
    - _Requirements: 1.5, 1.12, 10.4, 10.10_
  
  - [ ] 9.4 Implement asset price list section
    - Create asset price card components with responsive design
    - Display Bitcoin, Ethereum, Solana, Gold, Dogecoin with current prices
    - Show 24-hour percentage change with color indicators (text-green-500/text-red-500)
    - Fetch real-time prices from existing backend assets array
    - Subscribe to Socket.IO 'price_update' event for real-time updates
    - Make horizontally scrollable on mobile devices (overflow-x-auto)
    - _Requirements: 1.7, 10.5_
  
  - [ ] 9.5 Implement news/announcement section
    - Create news card component with image and text layout
    - Add placeholder content for platform announcements
    - Implement responsive layout for mobile (stack) and desktop (side-by-side)
    - Use existing card styling patterns from other components
    - _Requirements: 1.6_
  
  - [ ] 9.6 Implement portfolio performance chart
    - Use Recharts (already in dependencies) to create 7-day performance line chart
    - Fetch historical balance data from transactions endpoint
    - Calculate daily balance snapshots from transaction history
    - Add responsive chart sizing for different screen sizes (h-64 on mobile, h-80 on desktop)
    - Style chart with existing color scheme (primary blue, success green)
    - _Requirements: 1.3, 10.1, 10.2, 10.3_
  
  - [ ] 9.7 Update authentication flow to redirect to Dashboard
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
  - [ ] 10.1 Create Mining component structure
    - Create new Mining.tsx component file in trass/src/components
    - Implement responsive layout for mobile and desktop using Tailwind CSS
    - Add navigation back to dashboard using React Router Link component
    - Use existing color scheme and component patterns from Dashboard
    - Add header with mining icon and title
    - _Requirements: 2.1, 2.11, 10.7_
  
  - [ ] 10.2 Implement mining option selection interface
    - Create mining option cards for Bitcoin, Ethereum, Solana, Litecoin, Dogecoin
    - Display mining difficulty (easy/medium/hard), estimated rewards, time requirements for each option
    - Add selection state management using useState hook
    - Implement responsive grid layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
    - Style selected card with border highlight and background color change
    - _Requirements: 2.2, 2.3, 2.4_
  
  - [ ] 10.3 Implement mining initiation logic
    - Add "Start Mining" button with balance validation
    - Call POST /api/mining/start endpoint with selected coin and user email
    - Deduct mining fee from displayed balance optimistically
    - Handle insufficient balance error with toast notification
    - Prevent multiple concurrent mining operations by checking active session
    - Disable start button while mining is active
    - _Requirements: 2.5, 2.9, 2.10_
  
  - [ ] 10.4 Implement mining progress display
    - Create progress bar component with percentage display using Tailwind width classes
    - Show estimated completion time countdown using setInterval
    - Display current mining status (active/completed/failed) with status badges
    - Subscribe to Socket.IO 'mining:progress' events in useEffect
    - Update progress bar in real-time based on event data
    - Add animated progress bar transition
    - _Requirements: 2.6, 2.11_
  
  - [ ] 10.5 Implement mining completion handling
    - Subscribe to Socket.IO 'mining:complete' event in useEffect
    - Display completion notification with reward amount using toast
    - Update user balance with earned cryptocurrency
    - Add mining session to history display automatically
    - Play success animation using Framer Motion
    - _Requirements: 2.7, 2.8_
  
  - [ ] 10.6 Implement mining history display
    - Create mining history table/list component with responsive design
    - Display start time, end time, cryptocurrency mined, rewards earned columns
    - Fetch mining history from GET /api/mining/status/:userId endpoint
    - Add pagination for long history lists (10 items per page)
    - Format dates using date-fns library
    - _Requirements: 2.8_
  
  - [ ] 10.7 Implement mining state persistence
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
  - [ ] 11.1 Create CoinManagement component structure
    - Create new CoinManagement.tsx component file in trass/src/components
    - Implement responsive layout with table/card view toggle
    - Add navigation and breadcrumb using existing AdminPanel patterns
    - Use Tailwind CSS matching existing admin panel design
    - Add header with "Coin Management" title and "Add Coin" button
    - _Requirements: 3.1, 3.12_
  
  - [ ] 11.2 Implement coin listing display
    - Create coin table with columns for symbol, name, price, volatility, type, custom flag
    - Display manipulation status with visual indicators (badges with colors)
    - Add sorting and filtering capabilities using state management
    - Fetch coins from GET /api/admin/market endpoint (existing)
    - Use existing table styling patterns from AdminPanel
    - _Requirements: 3.5, 3.11_
  
  - [ ] 11.3 Implement add coin form
    - Create modal form for adding new coins using existing modal patterns
    - Add input fields for symbol, name, price, volatility, type (crypto/commodity/stock)
    - Add optional manipulation controls section (direction, duration, unit)
    - Implement form validation with error messages using react-hook-form
    - Call POST /api/admin/market/add endpoint (existing) on submit
    - Add x-user-email header with admin email for permission check
    - _Requirements: 3.2, 3.3, 3.4, 3.10_
  
  - [ ] 11.4 Implement edit coin functionality
    - Create modal form for editing existing coins
    - Pre-populate form with current coin data
    - Allow editing price, volatility, and manipulation parameters
    - Call PATCH /api/admin/market/:id endpoint (existing) on submit
    - Add x-user-email header with admin email for permission check
    - _Requirements: 3.6, 3.9_
  
  - [ ] 11.5 Implement delete coin functionality
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
  - [ ] 12.1 Create UserManagement component structure
    - Create new UserManagement.tsx component file in src/components
    - Implement responsive layout with table view
    - Add search bar and filter controls
    - Use Tailwind CSS matching existing admin panel design
    - _Requirements: 4.1, 4.2_
  
  - [ ] 12.2 Implement user listing display
    - Create user table with columns for email, name, balance, role, registration date
    - Add pagination controls
    - Implement search functionality
    - Fetch users from GET /api/admin/users endpoint
    - _Requirements: 4.2, 4.3_
  
  - [ ] 12.3 Implement user detail view
    - Create modal or side panel for detailed user information
    - Display trade history and transaction history
    - Show user statistics (total trades, win rate, account status)
    - _Requirements: 4.4, 4.12_
  
  - [ ] 12.4 Implement create user form
    - Create modal form for creating new users
    - Add input fields for email, password, display name, role, initial balance
    - Implement form validation
    - Call POST /api/admin/users endpoint on submit
    - _Requirements: 4.6, 4.7_
  
  - [ ] 12.5 Implement edit user functionality
    - Create modal form for editing user data
    - Allow balance adjustment, role change, permission updates
    - Call PUT /api/admin/users/:userId endpoint on submit
    - _Requirements: 4.5, 4.8_
  
  - [ ] 12.6 Implement delete user functionality
    - Add delete button with confirmation dialog
    - Display warning about cascade deletion
    - Call DELETE /api/admin/users/:userId endpoint
    - _Requirements: 4.9, 4.10_
  
  - [ ] 12.7 Implement force transaction functionality
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
  - [ ] 13.1 Create TransactionManagement component structure
    - Create new TransactionManagement.tsx component file in src/components
    - Implement responsive layout with table view
    - Add filter controls and date range picker
    - Use Tailwind CSS matching existing admin panel design
    - _Requirements: 5.1_
  
  - [ ] 13.2 Implement transaction listing display
    - Create transaction table with columns for type, amount, user, status, timestamp
    - Add pagination controls
    - Implement filtering by type, user, date range
    - Fetch transactions from GET /api/admin/transactions endpoint
    - Sort by timestamp descending
    - _Requirements: 5.2, 5.3, 5.4, 5.9_
  
  - [ ] 13.3 Implement transaction statistics display
    - Create statistics cards for total deposits, withdrawals, net flow
    - Display transaction trends chart using Recharts
    - Calculate statistics from transaction data
    - _Requirements: 5.5, 5.6, 5.12_
  
  - [ ] 13.4 Implement transaction export functionality
    - Add export button to download CSV
    - Call GET /api/admin/transactions/export endpoint
    - Handle file download in browser
    - _Requirements: 5.8_
  
  - [ ] 13.5 Implement auto-refresh functionality
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
  - [ ] 14.1 Create WalletManagement component structure
    - Create new WalletManagement.tsx component file in src/components
    - Implement responsive layout with table view
    - Add search bar and filter controls
    - Use Tailwind CSS matching existing admin panel design
    - _Requirements: 6.1_
  
  - [ ] 14.2 Implement wallet listing display
    - Create wallet table with columns for user, balance, frozen balance, status, last activity
    - Add pagination controls
    - Implement search functionality
    - Fetch wallets from GET /api/admin/wallets endpoint
    - _Requirements: 6.2, 6.3_
  
  - [ ] 14.3 Implement wallet statistics display
    - Create statistics cards for total platform balance, average balance
    - Calculate statistics from wallet data
    - _Requirements: 6.8_
  
  - [ ] 14.4 Implement wallet credit functionality
    - Add credit button for each wallet
    - Create modal form for credit amount and reason
    - Call POST /api/admin/wallets/:userId/credit endpoint
    - Update wallet display after successful credit
    - _Requirements: 6.5, 6.7, 6.10_
  
  - [ ] 14.5 Implement wallet debit functionality
    - Add debit button for each wallet
    - Create modal form for debit amount and reason
    - Validate debit amount against current balance
    - Call POST /api/admin/wallets/:userId/debit endpoint
    - Update wallet display after successful debit
    - _Requirements: 6.6, 6.7, 6.9, 6.10_
  
  - [ ] 14.6 Implement wallet freeze/unfreeze functionality
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
  - [ ] 15.1 Create Settings component structure
    - Create new Settings.tsx component file in src/components
    - Implement responsive layout with section tabs or accordion
    - Add save and reset buttons
    - Use Tailwind CSS matching existing admin panel design
    - _Requirements: 7.1, 7.12_
  
  - [ ] 15.2 Implement General settings section
    - Create form fields for platform name, maintenance mode, registration enabled
    - Fetch current settings from GET /api/admin/settings endpoint
    - _Requirements: 7.2_
  
  - [ ] 15.3 Implement Trading settings section
    - Create form fields for min/max trade amount, max leverage, commission rate
    - Add validation for min < max and valid ranges
    - _Requirements: 7.3, 7.5_
  
  - [ ] 15.4 Implement Binary trading duration settings
    - Create list of current duration options
    - Add functionality to add, edit, and delete duration options
    - _Requirements: 7.3, 7.4_
  
  - [ ] 15.5 Implement Mining settings section
    - Create form fields for mining enabled, min fee, reward multiplier, available coins
    - Add validation for positive values
    - _Requirements: 7.6_
  
  - [ ] 15.6 Implement KYC settings section
    - Create form fields for KYC required, auto-approve, required documents
    - _Requirements: 7.7_
  
  - [ ] 15.7 Implement settings save functionality
    - Call PUT /api/admin/settings endpoint with updated settings
    - Display success/error messages
    - Update last modified metadata display
    - _Requirements: 7.8, 7.9, 7.10_
  
  - [ ] 15.8 Implement reset to defaults functionality
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
  - [ ] 16.1 Add routes for new admin modules
    - Update AdminPanel.tsx in trass/src/components to include routes for CoinManagement, UserManagement, TransactionManagement, WalletManagement, Settings
    - Add navigation menu items for new modules in sidebar
    - Implement permission-based route guards using checkPermission helper
    - Use React Router's Routes and Route components for routing
    - Add lazy loading for admin components using React.lazy
    - _Requirements: 3.1, 4.1, 5.1, 6.1, 7.1_
  
  - [ ] 16.2 Update admin navigation menu
    - Add menu items with icons for new modules (Coins, Users, Transactions, Wallets, Settings)
    - Implement active state highlighting using useLocation hook
    - Add permission checks to hide/show menu items based on user role
    - Use existing navigation styling patterns from AdminPanel
    - Add tooltips for menu items on hover
    - _Requirements: 4.1, 5.1, 6.1_


- [ ] 17. Implement WebSocket event handlers
  - [ ] 17.1 Set up Socket.IO client connection
    - Initialize Socket.IO client in main App.tsx component using io() from socket.io-client
    - Handle connection and disconnection events with console logging
    - Implement reconnection logic with exponential backoff
    - Store socket instance in React context for global access
    - Add connection status indicator in UI
    - _Requirements: 2.6, 2.12_
  
  - [ ] 17.2 Implement mining event handlers
    - Subscribe to 'mining:progress' events in Mining component useEffect
    - Subscribe to 'mining:complete' events in Mining component useEffect
    - Subscribe to 'mining:error' events in Mining component useEffect
    - Update Mining component state on events (progress, status, error message)
    - Clean up event listeners on component unmount
    - _Requirements: 2.6, 2.7, 2.12_
  
  - [ ] 17.3 Implement market event handlers
    - Subscribe to 'price_update' events (existing) in Dashboard component useEffect
    - Subscribe to 'market:newCoin' events in Dashboard and CoinManagement components
    - Subscribe to 'market:coinRemoved' events in Dashboard and CoinManagement components
    - Update Dashboard and CoinManagement components state on events
    - Refresh asset price list and coin management table on events
    - _Requirements: 1.7, 3.8, 3.10_
  
  - [ ] 17.4 Implement admin event handlers
    - Subscribe to 'admin:userUpdate' events in UserManagement component useEffect
    - Subscribe to 'admin:transactionNew' events in TransactionManagement component useEffect
    - Subscribe to 'admin:settingsUpdate' events in Settings component useEffect
    - Update relevant admin components state on events
    - Refresh data tables automatically on events
    - _Requirements: 4.8, 5.11, 7.9_


- [ ] 18. Final checkpoint - Integration and testing
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 19. Code review and deployment preparation
  - [ ] 19.1 Review all code changes
    - Verify all components follow existing patterns
    - Check TypeScript types and interfaces
    - Verify error handling is consistent
    - Review responsive design implementation
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9_
  
  - [ ] 19.2 Test responsive design
    - Test on mobile devices (320px-768px)
    - Test on tablet devices (768px-1024px)
    - Test on desktop devices (>1024px)
    - Verify touch targets are at least 44x44 pixels
    - Test on iOS Safari, Android Chrome, desktop browsers
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10, 10.11, 10.12_
  
  - [ ] 19.3 Prepare Git commit and push
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
