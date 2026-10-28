// A root-directory static server should open the same app Netlify publishes.
const destination = new URL("./public/", window.location.href);
const fragment = window.location.hash;
const supported =
  /^#\/(home|guest|signin|signup|recover|reset|invite|resources|sample-owner|sample-advisor)(?:$|[?])/;
// Keep Identity callbacks intact, but do not carry retired prototype routes over.
destination.hash =
  supported.test(fragment) ||
  /(?:confirmation|recovery|invite)_token=/.test(fragment)
    ? fragment
    : "#/home";
window.location.replace(destination.href);
