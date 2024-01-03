// the type for Applicant! Wow. Ok, plz Note: property created_on is an ISO string
// I tried to make a type for it with template literals but.. for testing..
// I decided to try a package for runtime type checking. Unfortinately it doesn't seem
// to have very good template literal support, so I'm keeping the properties to primitive types
// as I think the usefullness of the package was mroe interesting than making exact string types

export interface Applicant {
  id: number
  firstname: string
  lastname: string
  email: string
  created_on: string
  info: string
}
