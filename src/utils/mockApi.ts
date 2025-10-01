import { Invite, OrgAdminRequest, Organization, User } from '../types';

type InternalUser = User & { password: string };
type InternalOrgAdminRequest = OrgAdminRequest & { password: string };

type OrgAdminRequestInput = {
  name: string;
  email: string;
  password: string;
  orgName: string;
  role: string;
};

type MemberSignupInput = {
  token: string;
  name: string;
  password: string;
};

const now = () => new Date().toISOString();

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2, 11)}`;
};

const sanitizeUser = (user: InternalUser): User => {
  const { password: _password, ...rest } = user;
  return rest as User;
};

const sanitizeRequest = (request: InternalOrgAdminRequest): OrgAdminRequest => {
  const { password: _password, ...rest } = request;
  return rest as OrgAdminRequest;
};

const mockDb = {
  users: [] as InternalUser[],
  organizations: [] as Organization[],
  invites: [] as Invite[],
  orgAdminRequests: [] as InternalOrgAdminRequest[],
};

(() => {
  const createdAt = now();

  const systemAdmin: InternalUser = {
    id: 'user-system-admin',
    name: 'Amelia Hart',
    email: 'system.admin@donehub.com',
    role: 'system_admin',
    status: 'active',
    created_at: createdAt,
    password: 'admin123',
  };

  const orgId = 'org-greentech';

  const orgAdmin: InternalUser = {
    id: 'user-org-admin',
    name: 'Liam Chen',
    email: 'liam@greentech.com',
    role: 'org_admin',
    org_id: orgId,
    status: 'active',
    created_at: createdAt,
    password: 'welcome123',
  };

  const member: InternalUser = {
    id: 'user-member',
    name: 'Noor Hassan',
    email: 'noor@greentech.com',
    role: 'member',
    org_id: orgId,
    status: 'active',
    created_at: createdAt,
    password: 'member123',
  };

  const organization: Organization = {
    id: orgId,
    name: 'GreenTech Solutions',
    created_by: orgAdmin.id,
    status: 'active',
    created_at: createdAt,
  };

  const invite: Invite = {
    id: 'invite-demo',
    org_id: orgId,
    email: 'future.member@greentech.com',
    token: 'demo-token',
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    created_at: createdAt,
  };

  const pendingRequest: InternalOrgAdminRequest = {
    id: 'request-pending-1',
    name: 'Chloe Rivera',
    email: 'chloe@ecoenterprises.com',
    org_name: 'EcoEnterprises',
    role: 'Operations Lead',
    status: 'pending',
    created_at: createdAt,
    password: 'securepass',
  };

  mockDb.users.push(systemAdmin, orgAdmin, member);
  mockDb.organizations.push(organization);
  mockDb.invites.push(invite);
  mockDb.orgAdminRequests.push(pendingRequest);
})();

export const signIn = async (email: string, password: string): Promise<User> => {
  const user = mockDb.users.find(
    (candidate) => candidate.email.toLowerCase() === email.toLowerCase() && candidate.password === password,
  );

  if (!user) {
    throw new Error('Invalid email or password');
  }

  return sanitizeUser(user);
};

export const signUp = async (email: string, password: string, name?: string): Promise<User> => {
  const existing = mockDb.users.find((candidate) => candidate.email.toLowerCase() === email.toLowerCase());

  if (existing) {
    throw new Error('Email is already registered');
  }

  const user: InternalUser = {
    id: generateId(),
    name: name || email.split('@')[0],
    email,
    role: 'member',
    status: 'pending',
    created_at: now(),
    password,
  };

  mockDb.users.push(user);
  return sanitizeUser(user);
};

export const signOut = async (): Promise<void> => {
  return;
};

export const getUserById = async (userId: string): Promise<User | null> => {
  const user = mockDb.users.find((candidate) => candidate.id === userId);
  return user ? sanitizeUser(user) : null;
};

export const createOrgAdminRequest = async (input: OrgAdminRequestInput): Promise<OrgAdminRequest> => {
  const hasAccount = mockDb.users.some((candidate) => candidate.email.toLowerCase() === input.email.toLowerCase());
  if (hasAccount) {
    throw new Error('An account with this email already exists');
  }

  const existingRequest = mockDb.orgAdminRequests.find(
    (request) => request.email.toLowerCase() === input.email.toLowerCase() && request.status === 'pending',
  );

  if (existingRequest) {
    throw new Error('A pending request already exists for this email');
  }

  const request: InternalOrgAdminRequest = {
    id: generateId(),
    name: input.name,
    email: input.email,
    org_name: input.orgName,
    role: input.role,
    status: 'pending',
    created_at: now(),
    password: input.password,
  };

  mockDb.orgAdminRequests.push(request);
  return sanitizeRequest(request);
};

export const listOrgAdminRequests = async (): Promise<OrgAdminRequest[]> => {
  return mockDb.orgAdminRequests
    .slice()
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map(sanitizeRequest);
};

export const approveOrgAdminRequest = async (
  requestId: string,
): Promise<{ organization: Organization; user: User }> => {
  const request = mockDb.orgAdminRequests.find((candidate) => candidate.id === requestId);

  if (!request) {
    throw new Error('Request not found');
  }

  if (request.status !== 'pending') {
    throw new Error('Only pending requests can be approved');
  }

  const organization: Organization = {
    id: generateId(),
    name: request.org_name,
    created_by: request.id,
    status: 'active',
    created_at: now(),
  };

  const user: InternalUser = {
    id: request.id,
    name: request.name,
    email: request.email,
    role: 'org_admin',
    org_id: organization.id,
    status: 'active',
    created_at: now(),
    password: request.password,
  };

  mockDb.organizations.push(organization);
  mockDb.users.push(user);

  request.status = 'active';
  request.rejected_reason = undefined;

  return { organization, user: sanitizeUser(user) };
};

export const rejectOrgAdminRequest = async (requestId: string, reason: string): Promise<OrgAdminRequest> => {
  const request = mockDb.orgAdminRequests.find((candidate) => candidate.id === requestId);

  if (!request) {
    throw new Error('Request not found');
  }

  if (request.status !== 'pending') {
    throw new Error('Only pending requests can be rejected');
  }

  request.status = 'rejected';
  request.rejected_reason = reason;

  return sanitizeRequest(request);
};

export const getOrganizationById = async (organizationId: string): Promise<Organization | null> => {
  const organization = mockDb.organizations.find((candidate) => candidate.id === organizationId);
  return organization ? { ...organization } : null;
};

export const listOrganizationMembers = async (organizationId: string): Promise<User[]> => {
  return mockDb.users
    .filter((user) => user.org_id === organizationId)
    .map(sanitizeUser);
};

export const listOrganizationInvites = async (organizationId: string): Promise<Invite[]> => {
  return mockDb.invites
    .filter((invite) => invite.org_id === organizationId)
    .slice()
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map((invite) => ({ ...invite }));
};

export const createInvite = async (organizationId: string, email: string, token: string, expiresAt: string): Promise<Invite> => {
  const duplicate = mockDb.invites.find(
    (invite) => invite.org_id === organizationId && invite.email.toLowerCase() === email.toLowerCase() && invite.status === 'pending',
  );

  if (duplicate) {
    throw new Error('An active invite already exists for this email');
  }

  const invite: Invite = {
    id: generateId(),
    org_id: organizationId,
    email,
    token,
    expires_at: expiresAt,
    status: 'pending',
    created_at: now(),
  };

  mockDb.invites.push(invite);
  return { ...invite };
};

export const verifyInviteToken = async (
  token: string,
): Promise<{ invite: Invite; organization: Organization | null }> => {
  const invite = mockDb.invites.find((candidate) => candidate.token === token);

  if (!invite) {
    throw new Error('Invalid invite token');
  }

  if (invite.status !== 'pending') {
    throw new Error('This invite has already been used');
  }

  if (new Date(invite.expires_at) < new Date()) {
    throw new Error('This invite has expired');
  }

  const organization = mockDb.organizations.find((candidate) => candidate.id === invite.org_id) || null;

  return { invite: { ...invite }, organization: organization ? { ...organization } : null };
};

export const completeMemberSignup = async (input: MemberSignupInput): Promise<User> => {
  const invite = mockDb.invites.find((candidate) => candidate.token === input.token);

  if (!invite) {
    throw new Error('Invite not found');
  }

  if (invite.status !== 'pending') {
    throw new Error('This invite is no longer valid');
  }

  if (new Date(invite.expires_at) < new Date()) {
    throw new Error('This invite has expired');
  }

  const existingUser = mockDb.users.find(
    (candidate) => candidate.email.toLowerCase() === invite.email.toLowerCase(),
  );

  if (existingUser) {
    throw new Error('An account with this email already exists');
  }

  const user: InternalUser = {
    id: generateId(),
    name: input.name,
    email: invite.email,
    role: 'member',
    org_id: invite.org_id,
    status: 'active',
    created_at: now(),
    password: input.password,
  };

  mockDb.users.push(user);
  invite.status = 'accepted';

  return sanitizeUser(user);
};
