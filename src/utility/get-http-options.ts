const GET_HTTP_OPTIONS = () => {
  return {
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    port: 443
  };
};
export { GET_HTTP_OPTIONS };