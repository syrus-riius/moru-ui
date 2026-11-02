module.exports = ({ config }) => {
  if (process.env.MORU_WEB_PREVIEW !== '1') return config;
  return {
    ...config,
    web: { ...config.web, bundler: 'metro', output: 'single' },
    experiments: { ...config.experiments, baseUrl: '/native-preview' },
  };
};
