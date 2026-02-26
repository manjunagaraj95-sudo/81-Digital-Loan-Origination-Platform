
import React, { useState, useEffect } from 'react';

// Assume 'fa' icons are available for production, here using text or basic shapes.
// For a real app, integrate FontAwesome or similar.

// --- RBAC Configuration ---
const ROLES = {
    ADMIN: 'System Administrator',
    REQUEST_INITIATOR: 'Request Initiator',
    FIELD_ENGINEER: 'Field Engineer',
    PROCUREMENT_MANAGER: 'Procurement & Vendor Manager',
    OPERATIONS_OFFICER: 'Operations & Maintenance Officer',
};

// Current user context (can be dynamic based on login)
const currentUserRole = ROLES.ADMIN; // Example: Set to ADMIN for full features
const currentUserId = 'user_admin_1';

// --- Global Constants & Sample Data ---
const STATUS_COLORS = {
    APPROVED: { color: 'var(--status-approved-color)', tint: 'var(--status-approved-tint)' },
    IN_PROGRESS: { color: 'var(--status-in-progress-color)', tint: 'var(--status-in-progress-tint)' },
    PENDING: { color: 'var(--status-pending-color)', tint: 'var(--status-pending-tint)' },
    REJECTED: { color: 'var(--status-rejected-color)', tint: 'var(--status-rejected-tint)' },
    EXCEPTION: { color: 'var(--status-exception-color)', tint: 'var(--status-exception-tint)' },
};

const getStatusClassName = (status) => {
    switch (status) {
        case 'Approved': return 'status-approved';
        case 'In Progress': return 'status-in-progress';
        case 'Pending': return 'status-pending';
        case 'Rejected': return 'status-rejected';
        case 'Exception': return 'status-exception';
        default: return '';
    }
};

const generateMockData = () => {
    const loanStatuses = ['Approved', 'In Progress', 'Pending', 'Rejected', 'Exception'];
    const loanStages = [
        'Application Intake',
        'KYC Validation',
        'Credit Scoring',
        'Underwriting',
        'Approval',
        'Disbursement'
    ];
    const applicants = ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Eve Adams'];

    const loans = Array.from({ length: 20 }, (_, i) => {
        const id = `LOAN-${1000 + i}`;
        const status = loanStatuses[Math.floor(Math.random() * loanStatuses.length)];
        const currentStageIndex = loanStages.indexOf('Application Intake') + Math.floor(Math.random() * loanStages.length);
        const currentStage = loanStages[currentStageIndex > loanStages.length - 1 ? loanStages.length - 1 : currentStageIndex];
        const isSlaBreached = Math.random() < 0.2; // 20% chance of SLA breach

        const milestones = loanStages.map((stage, idx) => ({
            name: stage,
            status: idx < currentStageIndex ? 'completed' : (idx === currentStageIndex ? 'current' : 'pending'),
            date: idx < currentStageIndex ? new Date(Date.now() - (currentStageIndex - idx) * 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
            slaDays: Math.floor(Math.random() * 7) + 3, // 3-9 days SLA
            isSlaBreached: idx === currentStageIndex && isSlaBreached
        }));

        const auditLog = Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, j) => {
            const actions = [
                `Loan application initiated by <strong>${applicants[Math.floor(Math.random() * applicants.length)]}</strong>.`,
                `KYC documents uploaded and validated.`,
                `Credit score generated: <strong>${(Math.random() * (850 - 300) + 300).toFixed(0)}</strong>.`,
                `Underwriting review ${Math.random() > 0.5 ? 'approved' : 'flagged for review'}.`,
                `Status changed to <strong>${status}</strong> by System Admin.`,
                `Document "Proof of Income.pdf" reviewed.`
            ];
            return {
                timestamp: new Date(Date.now() - (j + 1) * 2 * 24 * 60 * 60 * 1000).toLocaleString(),
                user: applicants[Math.floor(Math.random() * applicants.length)],
                action: actions[Math.floor(Math.random() * actions.length)]
            };
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by newest first

        return {
            id: id,
            name: `Loan for ${applicants[Math.floor(Math.random() * applicants.length)]}`,
            applicant: applicants[Math.floor(Math.random() * applicants.length)],
            amount: (Math.random() * (500000 - 10000) + 10000).toFixed(2),
            status: status,
            stage: currentStage,
            submittedDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            loanType: Math.random() > 0.5 ? 'Personal Loan' : 'Mortgage Loan',
            creditScore: (Math.random() * (850 - 300) + 300).toFixed(0),
            milestones: milestones,
            auditLog: auditLog,
            relatedDocuments: [
                { name: 'Application Form.pdf', type: 'PDF', uploadedBy: 'Alice J.', date: '2023-10-01' },
                { name: 'Proof of Identity.jpeg', type: 'Image', uploadedBy: 'Alice J.', date: '2023-10-01' },
                { name: 'Bank Statement.pdf', type: 'PDF', uploadedBy: 'System', date: '2023-10-02' },
            ],
        };
    });

    return loans;
};

function App() {
    const [view, setView] = useState({ screen: 'DASHBOARD', params: {} });
    const [loans, setLoans] = useState(() => generateMockData());
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ status: 'All' }); // Example filter

    // --- Handlers ---
    const handleCardClick = (loanId) => {
        setView({ screen: 'LOAN_DETAIL', params: { id: loanId } });
    };

    const handleBack = () => {
        setView({ screen: 'DASHBOARD', params: {} });
    };

    const handleGlobalSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    const getFilteredLoans = () => {
        let filtered = loans;

        // Apply search term
        if (searchTerm) {
            filtered = filtered.filter(loan =>
                loan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                loan.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                loan.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (filters.status !== 'All') {
            filtered = filtered.filter(loan => loan.status === filters.status);
        }

        return filtered;
    };

    const currentLoan = loans.find(loan => loan.id === view.params.id);

    // Dynamic UI based on RBAC
    const canInitiateLoan = [ROLES.REQUEST_INITIATOR, ROLES.ADMIN].includes(currentUserRole);
    const canViewAuditLogs = [ROLES.ADMIN, ROLES.OPERATIONS_OFFICER].includes(currentUserRole);
    const canEditLoan = [ROLES.FIELD_ENGINEER, ROLES.ADMIN].includes(currentUserRole); // Example role

    // --- Components / Render Functions ---
    const renderDashboard = () => {
        const dashboardLoans = getFilteredLoans();
        const totalLoans = loans.length;
        const approvedLoans = loans.filter(l => l.status === 'Approved').length;
        const inProgressLoans = loans.filter(l => l.status === 'In Progress').length;
        const pendingLoans = loans.filter(l => l.status === 'Pending').length;
        const rejectedLoans = loans.filter(l => l.status === 'Rejected').length;
        const exceptionLoans = loans.filter(l => l.status === 'Exception').length;

        return (
            <div className="main-content">
                <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>Digital Loan Origination Dashboard</h1>

                {/* KPI Overview Cards */}
                <div className="card-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <div className="status-card pulse-animation"> {/* Real-time pulse */}
                        <div className="status-card-title">Total Loans</div>
                        <div className="status-card-value">{totalLoans}</div>
                    </div>
                    <div className="status-card status-approved">
                        <div className="status-card-title">Approved</div>
                        <div className="status-card-value">{approvedLoans}</div>
                    </div>
                    <div className="status-card status-in-progress">
                        <div className="status-card-title">In Progress</div>
                        <div className="status-card-value">{inProgressLoans}</div>
                    </div>
                    <div className="status-card status-pending">
                        <div className="status-card-title">Pending</div>
                        <div className="status-card-value">{pendingLoans}</div>
                    </div>
                    <div className="status-card status-rejected">
                        <div className="status-card-title">Rejected</div>
                        <div className="status-card-value">{rejectedLoans}</div>
                    </div>
                    <div className="status-card status-exception">
                        <div className="status-card-title">Exceptions</div>
                        <div className="status-card-value">{exceptionLoans}</div>
                    </div>
                </div>

                {/* Charts Section */}
                <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Loan Performance & Trends</h2>
                <div className="card-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                        <h3 style={{ marginTop: '0', marginBottom: 'var(--spacing-sm)' }}>Loan Status Distribution (Donut)</h3>
                        <div className="chart-container">
                            {/* Placeholder for Donut Chart */}
                            <p>Donut Chart: Status Distribution</p>
                        </div>
                    </div>
                    <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                        <h3 style={{ marginTop: '0', marginBottom: 'var(--spacing-sm)' }}>Application Volume (Line)</h3>
                        <div className="chart-container">
                            {/* Placeholder for Line Chart */}
                            <p>Line Chart: Monthly Applications</p>
                        </div>
                    </div>
                    <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                        <h3 style={{ marginTop: '0', marginBottom: 'var(--spacing-sm)' }}>Average Approval Time (Gauge)</h3>
                        <div className="chart-container">
                            {/* Placeholder for Gauge Chart */}
                            <p>Gauge Chart: Avg. Approval Time (7.2 days)</p>
                        </div>
                    </div>
                </div>

                {/* Loan List & Filters */}
                <div className="flex-row-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <h2 style={{ margin: '0' }}>Recent Loan Applications</h2>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        {canInitiateLoan && (
                            <button className="btn btn-primary">
                                + Initiate New Loan
                            </button>
                        )}
                        {/* More action buttons like Export All */}
                        <button className="btn btn-secondary">Export All</button>
                    </div>
                </div>

                <div className="flex-row-between" style={{ marginBottom: 'var(--spacing-md)' }}>
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        <button
                            className={`btn ${filters.status === 'All' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleFilterChange('status', 'All')}
                        >
                            All ({loans.length})
                        </button>
                        {Object.keys(STATUS_COLORS).map(statusKey => (
                            <button
                                key={statusKey}
                                className={`btn ${filters.status === statusKey.replace('_', ' ') ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => handleFilterChange('status', statusKey.replace('_', ' '))}
                                style={{
                                    backgroundColor: filters.status === statusKey.replace('_', ' ') ? STATUS_COLORS[statusKey].color : 'var(--color-medium-gray)',
                                    color: filters.status === statusKey.replace('_', ' ') ? 'var(--color-white)' : 'var(--color-charcoal)'
                                }}
                            >
                                {statusKey.replace('_', ' ')} ({loans.filter(l => l.status === statusKey.replace('_', ' ')).length})
                            </button>
                        ))}
                    </div>
                </div>

                <div className="card-grid">
                    {dashboardLoans.length > 0 ? (
                        dashboardLoans.map(loan => (
                            <div
                                key={loan.id}
                                className={`card ${getStatusClassName(loan.status)}`}
                                onClick={() => handleCardClick(loan.id)}
                            >
                                <div className="flex-row-between" style={{ marginBottom: 'var(--spacing-sm)' }}>
                                    <h3 style={{ margin: '0', fontSize: 'var(--font-lg)' }}>{loan.name}</h3>
                                    <span className={`status-badge ${getStatusClassName(loan.status)}`}>
                                        <span className="status-dot" style={{ backgroundColor: STATUS_COLORS[loan.status?.toUpperCase().replace(' ', '_')]?.color }}></span>
                                        {loan.status}
                                    </span>
                                </div>
                                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-sm)' }}>
                                    Applicant: <strong>{loan.applicant}</strong>
                                </p>
                                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-sm)' }}>
                                    Amount: <strong>${parseFloat(loan.amount).toLocaleString()}</strong>
                                </p>
                                <p style={{ fontWeight: '600', color: 'var(--color-charcoal)', fontSize: 'var(--font-sm)' }}>
                                    Current Stage: {loan.stage}
                                </p>
                                {/* Quick actions on hover (conceptual for web) */}
                                {/* <div className="quick-actions">...</div> */}
                            </div>
                        ))
                    ) : (
                        <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                            <span className="empty-state-icon">📄</span>
                            <h3 className="empty-state-title">No Loans Found</h3>
                            <p className="empty-state-description">
                                Adjust your search or filters, or initiate a new loan application.
                            </p>
                            {canInitiateLoan && (
                                <button className="btn btn-primary empty-state-cta">
                                    Initiate New Loan
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderLoanDetail = (loan) => {
        if (!loan) return <div className="main-content">Loading loan details...</div>;

        return (
            <div className="main-content">
                {/* Breadcrumbs */}
                <div className="flex-row-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <div className="breadcrumbs">
                        <a href="#" onClick={handleBack}>Dashboard</a>
                        <span>/</span>
                        <span>{loan.name} ({loan.id})</span>
                    </div>
                    {/* Action buttons for Detail View */}
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        {canEditLoan && <button className="btn btn-secondary">Edit Loan</button>}
                        <button className="btn btn-primary">Approve/Reject</button>
                    </div>
                </div>

                <div className="detail-header">
                    <div>
                        <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>{loan.name}</h1>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-md)' }}>Loan ID: {loan.id}</p>
                    </div>
                    <span className={`status-badge ${getStatusClassName(loan.status)}`}>
                        <span className="status-dot" style={{ backgroundColor: STATUS_COLORS[loan.status?.toUpperCase().replace(' ', '_')]?.color }}></span>
                        {loan.status}
                    </span>
                </div>

                <div className="detail-grid">
                    <div className="detail-main-col">
                        {/* Loan Summary */}
                        <div className="card">
                            <h2 className="detail-section-header">Record Summary</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                <div className="detail-info-item">
                                    <span className="detail-info-label">Applicant Name</span>
                                    <span className="detail-info-value">{loan.applicant}</span>
                                </div>
                                <div className="detail-info-item">
                                    <span className="detail-info-label">Loan Amount</span>
                                    <span className="detail-info-value">${parseFloat(loan.amount)?.toLocaleString()}</span>
                                </div>
                                <div className="detail-info-item">
                                    <span className="detail-info-label">Loan Type</span>
                                    <span className="detail-info-value">{loan.loanType}</span>
                                </div>
                                <div className="detail-info-item">
                                    <span className="detail-info-label">Current Stage</span>
                                    <span className="detail-info-value">{loan.stage}</span>
                                </div>
                                <div className="detail-info-item">
                                    <span className="detail-info-label">Submitted Date</span>
                                    <span className="detail-info-value">{loan.submittedDate}</span>
                                </div>
                                <div className="detail-info-item">
                                    <span className="detail-info-label">Credit Score</span>
                                    <span className="detail-info-value">{loan.creditScore}</span>
                                </div>
                            </div>
                            {/* Example of related records or quick actions */}
                            <div style={{ marginTop: 'var(--spacing-lg)' }}>
                                <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Related Documents ({loan.relatedDocuments?.length})</h3>
                                {loan.relatedDocuments?.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                        {loan.relatedDocuments?.map((doc, idx) => (
                                            <div key={idx} className="flex-row-between" style={{ fontSize: 'var(--font-sm)', borderBottom: '1px dashed var(--color-medium-gray)', paddingBottom: 'var(--spacing-xs)' }}>
                                                <span>{doc.name} ({doc.type})</span>
                                                <button className="btn btn-text">Preview</button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>No documents uploaded.</p>
                                )}
                            </div>
                        </div>

                        {/* Milestone Tracker (Workflow Progress) */}
                        <div className="card">
                            <h2 className="detail-section-header">
                                Workflow Progress
                                <button className="btn btn-text">View Full Workflow</button>
                            </h2>
                            <div className="milestone-tracker">
                                {loan.milestones?.map((milestone, index) => (
                                    <div key={index} className="milestone-item">
                                        <div className={`milestone-status-dot ${milestone.status}`}></div>
                                        <div className="milestone-info">
                                            <div className="milestone-name">{milestone.name}</div>
                                            <div className="milestone-date">{milestone.date ? `Completed: ${milestone.date}` : 'Pending'}</div>
                                            <div className={`milestone-sla ${milestone.isSlaBreached ? 'breached' : ''}`}>
                                                SLA: {milestone.slaDays} days {milestone.isSlaBreached && '(Breached!)'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column: News/Audit Feed */}
                    <div className="detail-sidebar-col">
                        {canViewAuditLogs && (
                            <div className="card">
                                <h2 className="detail-section-header">
                                    News / Audit Feed
                                    <button className="btn btn-text">View All</button>
                                </h2>
                                {loan.auditLog?.length > 0 ? (
                                    <div className="audit-feed">
                                        {loan.auditLog?.slice(0, 5).map((log, index) => ( // Show recent 5 logs
                                            <div key={index} className="audit-feed-item">
                                                <div className="audit-meta">
                                                    <span>{log.user}</span>
                                                    <span>{log.timestamp}</span>
                                                </div>
                                                <div className="audit-action" dangerouslySetInnerHTML={{ __html: log.action }}></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>No recent audit activity.</p>
                                )}
                            </div>
                        )}
                         <div className="card">
                            <h2 className="detail-section-header">AI-Powered Insights</h2>
                            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}>
                                Proactive alert: This loan has a <strong>20% higher risk score</strong> than average for its segment due to recent credit inquiries.
                            </p>
                            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}>
                                Suggestion: Recommend additional fraud detection checks for KYC.
                            </p>
                            <button className="btn btn-text" style={{ marginTop: 'var(--spacing-md)' }}>View All Insights</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="App">
            {/* Header */}
            <header className="app-header">
                <div className="app-logo">LoanX</div>
                <nav className="app-nav">
                    <a
                        href="#"
                        className={`app-nav-item ${view.screen === 'DASHBOARD' ? 'active' : ''}`}
                        onClick={() => setView({ screen: 'DASHBOARD', params: {} })}
                    >
                        Dashboard
                    </a>
                    <a
                        href="#"
                        className={`app-nav-item ${view.screen === 'APPLICATIONS' ? 'active' : ''}`}
                        onClick={() => setView({ screen: 'APPLICATIONS', params: {} })}
                    >
                        Applications
                    </a>
                    <a
                        href="#"
                        className={`app-nav-item ${view.screen === 'REPORTS' ? 'active' : ''}`}
                        onClick={() => setView({ screen: 'REPORTS', params: {} })}
                    >
                        Reports
                    </a>
                    {currentUserRole === ROLES.ADMIN && (
                        <a
                            href="#"
                            className={`app-nav-item ${view.screen === 'ADMIN' ? 'active' : ''}`}
                            onClick={() => setView({ screen: 'ADMIN', params: {} })}
                        >
                            Admin
                        </a>
                    )}
                </nav>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    {/* Global Search */}
                    <div className="global-search-container">
                        <input
                            type="text"
                            placeholder="Global Search loans, applicants..."
                            className="global-search-input"
                            value={searchTerm}
                            onChange={handleGlobalSearch}
                        />
                        {/* Smart suggestions (conceptual) */}
                    </div>
                    {/* User Profile */}
                    <div className="user-profile">
                        <div className="user-avatar">AD</div>
                        <span className="user-name">Admin User</span>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            {view.screen === 'DASHBOARD' && renderDashboard()}
            {view.screen === 'LOAN_DETAIL' && renderLoanDetail(currentLoan)}
            {/* Placeholder for other screens */}
            {(view.screen === 'APPLICATIONS' || view.screen === 'REPORTS' || view.screen === 'ADMIN') && (
                <div className="empty-state">
                    <span className="empty-state-icon">🚧</span>
                    <h3 className="empty-state-title">Coming Soon!</h3>
                    <p className="empty-state-description">
                        This section is under active development. Stay tuned for exciting updates!
                    </p>
                    <button className="btn btn-primary empty-state-cta" onClick={handleBack}>
                        Go to Dashboard
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;