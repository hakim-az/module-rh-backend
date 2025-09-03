// auth/groups.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GROUPS_KEY } from "./groups.decorator";

@Injectable()
export class GroupsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredGroups = this.reflector.getAllAndOverride<string[]>(
      GROUPS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredGroups || requiredGroups.length === 0) {
      return true; // no groups required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.groups) {
      throw new ForbiddenException("No groups found in token");
    }

    const hasGroup = requiredGroups.some((g) => user.groups.includes(g));
    if (!hasGroup) {
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }
}
