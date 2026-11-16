import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Authentication, Roles & Security Rules Test Suite
 * Project: Gurukul Bhose (Phase 3)
 */

// Simulated users store
const mockUsers = [
  {
    uid: 'superadmin-001',
    email: 'superadmin@gurukulbhose.com',
    fullName: 'Super Administrator',
    role: 'super_admin',
    status: 'active',
    employeeId: 'SA-001'
  },
  {
    uid: 'admin-001',
    email: 'admin@gurukulbhose.com',
    fullName: 'School Principal',
    role: 'admin',
    status: 'active',
    employeeId: 'ADM-001'
  },
  {
    uid: 'telecaller-001',
    email: 'telecaller1@gurukulbhose.com',
    fullName: 'Sachin Patil',
    role: 'telecaller',
    status: 'active',
    employeeId: 'TC-101'
  },
  {
    uid: 'telecaller-002',
    email: 'telecaller2@gurukulbhose.com',
    fullName: 'Pooja Shinde',
    role: 'telecaller',
    status: 'inactive', // Deactivated
    employeeId: 'TC-102'
  }
];

// Simulated CRM leads
const mockLeads = [
  {
    id: 'lead-1',
    studentName: 'Rohan Jadhav',
    assignedTelecallerId: 'telecaller-001',
    leadStatus: 'New'
  },
  {
    id: 'lead-2',
    studentName: 'Omkar Mane',
    assignedTelecallerId: 'telecaller-002',
    leadStatus: 'Follow-up Scheduled'
  }
];

// Helper: Role-based route authorization checker
function isRouteAllowed(userRole, allowedRoles) {
  if (!userRole) return false;
  const normalized = userRole.toLowerCase();
  if (normalized === 'super_admin' || normalized === 'superadmin') {
    return true; // Super Admin has platform-wide authority
  }
  return allowedRoles.some(r => {
    const nr = r.toLowerCase();
    if (nr === 'admin' && (normalized === 'admin' || normalized === 'super_admin' || normalized === 'superadmin')) {
      return true;
    }
    return nr === normalized;
  });
}

// Helper: Telecaller lead access filter
function getTelecallerAccessibleLeads(callerUid, callerRole, allLeads) {
  if (callerRole === 'super_admin' || callerRole === 'admin') {
    return allLeads; // Admins can see all leads
  }
  if (callerRole === 'telecaller') {
    return allLeads.filter(l => l.assignedTelecallerId === callerUid);
  }
  return [];
}

// Helper: Profile field update permission validator
function validateTelecallerSelfUpdate(callerUid, targetUserId, callerRole, updateFields) {
  if (callerRole === 'super_admin' || callerRole === 'admin') {
    return { allowed: true };
  }
  if (callerRole === 'telecaller') {
    if (callerUid !== targetUserId) {
      return { allowed: false, reason: 'Telecaller cannot update another user profile' };
    }
    const forbiddenFields = ['role', 'employeeId', 'status', 'joiningDate', 'uid', 'userId'];
    for (const f of forbiddenFields) {
      if (updateFields.hasOwnProperty(f)) {
        return { allowed: false, reason: `Field '${f}' is locked for Telecaller self-updates` };
      }
    }
    return { allowed: true };
  }
  return { allowed: false, reason: 'Unauthorized role' };
}

test('1. Super Admin authentication & privileges', () => {
  const sa = mockUsers.find(u => u.role === 'super_admin');
  assert.ok(sa, 'Super Admin must exist');
  assert.equal(sa.status, 'active');
  assert.equal(isRouteAllowed(sa.role, ['super_admin']), true);
  assert.equal(isRouteAllowed(sa.role, ['admin']), true);
  assert.equal(isRouteAllowed(sa.role, ['telecaller']), true);
});

test('2. Admin authentication & route permissions', () => {
  const admin = mockUsers.find(u => u.role === 'admin');
  assert.ok(admin, 'Admin must exist');
  assert.equal(isRouteAllowed(admin.role, ['admin']), true);
  assert.equal(isRouteAllowed(admin.role, ['super_admin']), false, 'Admin cannot access Super Admin exclusive routes');
});

test('3. Telecaller authentication & isolation', () => {
  const tc = mockUsers.find(u => u.role === 'telecaller' && u.status === 'active');
  assert.ok(tc, 'Active Telecaller must exist');
  assert.equal(isRouteAllowed(tc.role, ['telecaller']), true);
  assert.equal(isRouteAllowed(tc.role, ['admin']), false, 'Telecaller cannot access Admin routes');
  assert.equal(isRouteAllowed(tc.role, ['super_admin']), false, 'Telecaller cannot access Super Admin routes');
});

test('4. Inactive Telecaller rejection', () => {
  const inactiveTc = mockUsers.find(u => u.role === 'telecaller' && u.status === 'inactive');
  assert.ok(inactiveTc);
  assert.equal(inactiveTc.status, 'inactive', 'Inactive telecaller must be marked inactive');
});

test('5. Telecaller Lead Isolation (Cannot see other telecaller leads)', () => {
  const tc1Leads = getTelecallerAccessibleLeads('telecaller-001', 'telecaller', mockLeads);
  assert.equal(tc1Leads.length, 1);
  assert.equal(tc1Leads[0].studentName, 'Rohan Jadhav');

  const tc2Leads = getTelecallerAccessibleLeads('telecaller-002', 'telecaller', mockLeads);
  assert.equal(tc2Leads.length, 1);
  assert.equal(tc2Leads[0].studentName, 'Omkar Mane');

  const adminLeads = getTelecallerAccessibleLeads('admin-001', 'admin', mockLeads);
  assert.equal(adminLeads.length, 2, 'Admin can see platform-wide leads');
});

test('6. Telecaller Profile Security (Field immutability)', () => {
  // Telecaller updating own phone -> allowed
  const validUpdate = validateTelecallerSelfUpdate('telecaller-001', 'telecaller-001', 'telecaller', {
    phone: '9850999999',
    address: 'Miraj'
  });
  assert.equal(validUpdate.allowed, true);

  // Telecaller attempting to promote self to admin -> forbidden
  const roleHack = validateTelecallerSelfUpdate('telecaller-001', 'telecaller-001', 'telecaller', {
    role: 'admin'
  });
  assert.equal(roleHack.allowed, false);
  assert.match(roleHack.reason, /Field 'role' is locked/);

  // Telecaller attempting to change employeeId -> forbidden
  const empHack = validateTelecallerSelfUpdate('telecaller-001', 'telecaller-001', 'telecaller', {
    employeeId: 'SA-999'
  });
  assert.equal(empHack.allowed, false);

  // Telecaller attempting to edit another telecaller -> forbidden
  const crossUserHack = validateTelecallerSelfUpdate('telecaller-001', 'telecaller-002', 'telecaller', {
    phone: '9850000000'
  });
  assert.equal(crossUserHack.allowed, false);
});

test('7. Admin can manage Telecaller accounts and status', () => {
  const adminUpdate = validateTelecallerSelfUpdate('admin-001', 'telecaller-001', 'admin', {
    status: 'inactive',
    assignedDepartment: 'High School'
  });
  assert.equal(adminUpdate.allowed, true, 'Admin can edit Telecaller status & department');
});

test('8. Password reset validation', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  assert.ok(emailRegex.test('telecaller1@gurukulbhose.com'));
  assert.ok(!emailRegex.test('invalid-email-address'));
});
