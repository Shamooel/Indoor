export function goTo(path) { window.history.pushState(null, '', path); window.dispatchEvent(new PopStateEvent('popstate')); }
export function safeNext(value) { return typeof value === 'string' && /^\/(account\/(?:profile|teams|bookings|matches|statistics|invitations|settings|edit)|booking|teams(?:\/[^?#]+)?|challenges|inbox)(?:[?#].*)?$/.test(value) ? value : ''; }
export function requiresAccount(path) { return /^\/account\//.test(path) || /^\/teams\/[^/]+\/manage\/?$/.test(path) || ['/booking','/account/edit','/teams/create','/challenges','/inbox'].includes(path.replace(/\/$/, '')); }
