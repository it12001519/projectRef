const localhost = {
  banner: {
      color: 'success',
      message: '*** LOCALHOST *** LOCALHOST *** LOCALHOST *** LOCALHOST *** LOCALHOST *** LOCALHOST *** LOCALHOST ***',
      urlAdhoc: 'http://changelink-rpt-dev.itg.ti.com'
  },
  cip: {
      message: 'TI Confidential - NDA Restrictions'
  },
  gateway: {
    url: 'http://localhost.dhcp.ti.com:8090'
  }
}

const dev = {
  banner: {
      color: 'success',
      message: '*** DEVELOPMENT *** DEVELOPMENT *** DEVELOPMENT *** DEVELOPMENT *** DEVELOPMENT *** DEVELOPMENT *** DEVELOPMENT ***',
      urlAdhoc: 'http://changelink-rpt-dev.itg.ti.com'
  },
  cip: {
      message: 'TI Confidential - NDA Restrictions'
  },
  gateway: {
    url: 'http://changelink-api-dev.itg.ti.com:8090'
  }
}

const stage = {
  banner: {
      color: 'warning',
      message: '*** STAGE *** STAGE *** STAGE *** STAGE *** STAGE *** STAGE *** STAGE *** STAGE *** STAGE ***',
      urlAdhoc: 'http://changelink-rpt-stage.itg.ti.com'
  },
  cip: {
      message: 'TI Confidential - NDA Restrictions'
  },
  gateway: {
    url: 'http://changelink-api-stage.itg.ti.com:8090'
  }
}

const prod = {
  banner: {
      color: 'danger',
      message: '',
      urlAdhoc: 'http://changelink-rpt.itg.ti.com'
  },
  cip: {
      message: 'TI Confidential - NDA Restrictions'
  },
  gateway: {
    url: 'http://changelink-api.itg.ti.com:8090'
  }
} 

let env = localhost;

switch(process.env.REACT_APP_ENV) {
  case 'dev':
      env = dev;
      break;
  case 'stage':
      env = stage;
      break;
  case 'prod':
      env = prod;
      break;
  default:
      env = localhost;
}

export var Config = env; 