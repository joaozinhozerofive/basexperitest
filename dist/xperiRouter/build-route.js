export function buildRoute(route) {
    const routeParametersRegex = /:([A-Za-z\-_]+)/g;
    const routeWithParams = route.replaceAll(routeParametersRegex, '([a-zA-Z0-9\\-_]+)');
    return routeWithParams;
}
