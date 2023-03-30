import passport from "passport";

export const passportCall = (strategy) => {
  return async (req, res, next) => {
    passport.authenticate(strategy, function (err, user) {
      if (err) return next(err);
      if (!user) {
        return res
          .status(401)
          .json({ status: "error", error: "Invalid credentials" });
      }

      req.user = user;
      next();
    })(req, res, next);
  };
};

export const viewsPassportCall = (strategy) => {
  return async (req, res, next) => {
    passport.authenticate(strategy, function (err, user) {
      if (err) return next(err);
      if (!user) {
        return res
          .status(401)
          .render("errors/base", { error: "Invalid credentials" });
      }

      req.user = user;
      next();
    })(req, res, next);
  };
};

export const authorization = (role) => {
  return async (req, res, next) => {
    const user = req.user || null;

    if (!user)
      return res
        .status(401)
        .json({ status: "error", error: "Unauthenticated" });
    if (user.role !== role)
      return res.status(403).json({ status: "error", error: "Unauthorized" });
    next();
  };
};

export const viewsAuthorization = (role) => {
  return async (req, res, next) => {
    const user = req.user || null;

    if (!user) return res.status(401).redirect("/login");
    if (user.role !== role)
      return res
        .status(403)
        .render("errors/base", { error: "Not authorized", user });
    next();
  };
};