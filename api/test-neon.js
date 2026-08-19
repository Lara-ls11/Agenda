export default {
  async fetch() {
    return Response.json({
      success: true,
      message: "API da Vercel está a funcionar",
    });
  },
};