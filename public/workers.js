// Cloudflare Worker for Mail System API
// Handles all the backend operations for the mail system

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Available users in the system
const USERS = [
  { username: 'Q38', name: 'Nate' },
  { username: 'Q09', name: 'Nadh' }
];

// Helper function to generate unique IDs
function generateId() {
  return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
}

// Helper function to create response with CORS headers
function createResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Helper function to validate user exists
function validateUser(username) {
  return USERS.some(user => user.username === username);
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const url = new URL(request.url);
  const path = url.pathname;

  try {
    // Route handling
    if (path === '/api/users' && request.method === 'GET') {
      return handleGetUsers();
    }
    
    if (path === '/api/mails' && request.method === 'POST') {
      return handleSendMail(request);
    }
    
    if (path.startsWith('/api/mails/') && path.endsWith('/unread-count') && request.method === 'GET') {
      const username = path.split('/')[3];
      return handleGetUnreadCount(username);
    }
    
    if (path.startsWith('/api/mails/') && !path.includes('unread-count') && request.method === 'GET') {
      const username = path.split('/')[3];
      return handleGetMails(username);
    }
    
    if (path.startsWith('/api/mails/') && path.endsWith('/read') && request.method === 'PUT') {
      const mailId = path.split('/')[3];
      return handleMarkAsRead(request, mailId);
    }
    
    if (path.startsWith('/api/mails/') && !path.endsWith('/read') && request.method === 'DELETE') {
      const mailId = path.split('/')[3];
      return handleDeleteMail(request, mailId);
    }

    // Default 404 response
    return createResponse({ error: 'Not found' }, 404);
    
  } catch (error) {
    console.error('Error handling request:', error);
    return createResponse({ error: 'Internal server error' }, 500);
  }
}

// Get all users
async function handleGetUsers() {
  return createResponse({ users: USERS });
}

// Send a mail
async function handleSendMail(request) {
  try {
    const { from, to, subject, message, priority } = await request.json();
    
    // Validate required fields
    if (!from || !to || !subject || !message) {
      return createResponse({ error: 'Missing required fields' }, 400);
    }
    
    // Validate users exist
    if (!validateUser(from) || !validateUser(to)) {
      return createResponse({ error: 'Invalid user' }, 400);
    }
    
    // Create mail object
    const mail = {
      id: generateId(),
      from,
      to,
      subject,
      message,
      priority: priority || 'normal',
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    // Get existing mails from KV storage
    const existingMailsData = await MAIL_STORAGE.get('mails');
    const existingMails = existingMailsData ? JSON.parse(existingMailsData) : [];
    
    // Add new mail
    existingMails.push(mail);
    
    // Save back to KV storage
    await MAIL_STORAGE.put('mails', JSON.stringify(existingMails));
    
    return createResponse({ 
      message: 'Mail sent successfully',
      mail 
    });
    
  } catch (error) {
    console.error('Error sending mail:', error);
    return createResponse({ error: 'Failed to send mail' }, 500);
  }
}

// Get mails for a specific user
async function handleGetMails(username) {
  try {
    // Validate user
    if (!validateUser(username)) {
      return createResponse({ error: 'Invalid user' }, 400);
    }
    
    // Get all mails from KV storage
    const mailsData = await MAIL_STORAGE.get('mails');
    const allMails = mailsData ? JSON.parse(mailsData) : [];
    
    // Filter mails for the specific user
    const userMails = allMails.filter(mail => mail.to === username);
    
    return createResponse({ mails: userMails });
    
  } catch (error) {
    console.error('Error getting mails:', error);
    return createResponse({ error: 'Failed to get mails' }, 500);
  }
}

// Get unread count for a specific user
async function handleGetUnreadCount(username) {
  try {
    // Validate user
    if (!validateUser(username)) {
      return createResponse({ error: 'Invalid user' }, 400);
    }
    
    // Get all mails from KV storage
    const mailsData = await MAIL_STORAGE.get('mails');
    const allMails = mailsData ? JSON.parse(mailsData) : [];
    
    // Count unread mails for the specific user
    const unreadCount = allMails.filter(mail => 
      mail.to === username && !mail.isRead
    ).length;
    
    return createResponse({ unreadCount });
    
  } catch (error) {
    console.error('Error getting unread count:', error);
    return createResponse({ error: 'Failed to get unread count' }, 500);
  }
}

// Mark a mail as read
async function handleMarkAsRead(request, mailId) {
  try {
    const { userId } = await request.json();
    
    // Validate user
    if (!validateUser(userId)) {
      return createResponse({ error: 'Invalid user' }, 400);
    }
    
    // Get all mails from KV storage
    const mailsData = await MAIL_STORAGE.get('mails');
    const allMails = mailsData ? JSON.parse(mailsData) : [];
    
    // Find and update the mail
    let mailFound = false;
    const updatedMails = allMails.map(mail => {
      if (mail.id === mailId && mail.to === userId) {
        mailFound = true;
        return { ...mail, isRead: true };
      }
      return mail;
    });
    
    if (!mailFound) {
      return createResponse({ error: 'Mail not found or unauthorized' }, 404);
    }
    
    // Save updated mails back to KV storage
    await MAIL_STORAGE.put('mails', JSON.stringify(updatedMails));
    
    return createResponse({ message: 'Mail marked as read' });
    
  } catch (error) {
    console.error('Error marking mail as read:', error);
    return createResponse({ error: 'Failed to mark mail as read' }, 500);
  }
}

// Delete a mail
async function handleDeleteMail(request, mailId) {
  try {
    const { userId } = await request.json();
    
    // Validate user
    if (!validateUser(userId)) {
      return createResponse({ error: 'Invalid user' }, 400);
    }
    
    // Get all mails from KV storage
    const mailsData = await MAIL_STORAGE.get('mails');
    const allMails = mailsData ? JSON.parse(mailsData) : [];
    
    // Find the mail to delete
    const mailToDelete = allMails.find(mail => mail.id === mailId && mail.to === userId);
    
    if (!mailToDelete) {
      return createResponse({ error: 'Mail not found or unauthorized' }, 404);
    }
    
    // Filter out the mail to delete
    const updatedMails = allMails.filter(mail => 
      !(mail.id === mailId && mail.to === userId)
    );
    
    // Save updated mails back to KV storage
    await MAIL_STORAGE.put('mails', JSON.stringify(updatedMails));
    
    return createResponse({ message: 'Mail deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting mail:', error);
    return createResponse({ error: 'Failed to delete mail' }, 500);
  }
}