const PRODUCTION_ENDPOINTS = Object.freeze({
  ecosystem: 'https://vivoamigo.com',
  payment: 'https://payvivoamigo.com',
  cargo: 'https://cargovivo.com',
  pos: 'https://pos.vivoamigo.com'
});

function endpoint(name, environment = process.env.VIVO_ENV || 'production') {
  if (environment !== 'production') return process.env[`VIVO_${name.toUpperCase()}_ORIGIN`] || PRODUCTION_ENDPOINTS[name];
  return PRODUCTION_ENDPOINTS[name];
}

module.exports = { PRODUCTION_ENDPOINTS, endpoint };
