// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.

export const environment = {
  production: false,
  apiUrls: {
    mean:   'https://playerhub-backend-mean-jbpcjhx2eq-uc.a.run.app',
    spring: 'https://playerhub-player-jbpcjhx2eq-uc.a.run.app',
  },
  // Emails con permisos de admin. DEBE coincidir con ADMIN_EMAILS del backend.
  // Es solo para ocultar UI en el FE; el backend es la fuente de verdad.
  adminEmails: ['admin@gmail.com'],
  firebase: {
    apiKey: 'AIzaSyAoYUDCjsv7vX87ZpcQXevXidNEcuJ3uG8',
    authDomain: 'playerhub-d019c.firebaseapp.com',
    projectId: 'playerhub-d019c',
    storageBucket: 'playerhub-d019c.firebasestorage.app',
    messagingSenderId: '946292759467',
    appId: '1:946292759467:web:377fd763368623dd9f50ee',
  },
};
