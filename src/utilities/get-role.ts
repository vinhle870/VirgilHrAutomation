import { UserInfo } from "src/objects";

export default function getRole(customerInfo: any, members: UserInfo[]): any[] {
  const roles: any[] = [];

  for (const team of customerInfo.teams)
    for (const member of team.members)
      if (members.some((m) => m.email === member.email))
        roles.push(member.role);

  return roles;
}
