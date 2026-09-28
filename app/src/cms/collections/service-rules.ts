/** Service slug rule, shared by the schema and the admin client (no server imports). `index` is reserved. */
export const SERVICE_SLUG = /^(?!index$)[a-z0-9][a-z0-9-]{0,63}$/;
