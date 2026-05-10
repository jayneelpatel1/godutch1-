/**
 * @file Auth service barrel exports.
 * @description Re-exports Firebase auth functions with friendlier names for internal use.
 *
 * @exports signOut — alias for signOutWithGoogle
 * @exports onAuthStateChange — alias for onGoogleAuthStateChange
 */

export { signOutWithGoogle as signOut } from './googleAuth';
export { onGoogleAuthStateChange as onAuthStateChange } from './googleAuth';
