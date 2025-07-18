declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      username?: string
      bio?: string
      timezone?: string
    }
  }

  interface User {
    id: string
    email: string
    name?: string
    image?: string
    username?: string
    bio?: string
    timezone?: string
  }
}
