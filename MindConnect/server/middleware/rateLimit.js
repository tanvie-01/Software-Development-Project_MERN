// সিম্পল in-memory রেট লিমিটার (প্রতি IP তে নির্দিষ্ট সময়ে সর্বোচ্চ রিকোয়েস্ট)
const rateLimit = ({ windowMs, max, message }) => {
  const hits = new Map();

  // পুরনো এন্ট্রি মুছে ফেলা, যাতে মেমোরি না বাড়ে
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, windowMs).unref();

  return (req, res, next) => {
    const now = Date.now();
    const entry = hits.get(req.ip);

    if (!entry || entry.resetAt <= now) {
      hits.set(req.ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      res.set("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
      return res.status(429).json({ message });
    }
    next();
  };
};

module.exports = rateLimit;
