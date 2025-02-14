import {Inject, InjectorService, PlatformApplication} from "@tsed/common";
import {Constant, Module} from "@tsed/di";
import koaMount from "koa-mount";
import {OidcAdapters} from "./services/OidcAdapters";
import {OidcJwks} from "./services/OidcJwks";
import {OidcProvider} from "./services/OidcProvider";

@Module({
  imports: [OidcProvider, OidcAdapters, OidcJwks]
})
export class OidcModule {
  @Inject()
  protected app: PlatformApplication;

  @Constant("PLATFORM_NAME")
  protected platformName: string;

  @Constant("oidc.path", "/")
  protected basePath: string;

  @Inject()
  protected oidcProvider: OidcProvider;

  @Inject()
  protected injector: InjectorService;

  async $onInit() {
    if (this.oidcProvider.hasConfiguration()) {
      await this.oidcProvider.create();
    }
  }

  async $onRoutesInit() {
    if (this.basePath !== "/") {
      this.app.use(await this.getRewriteMiddleware());
    }
  }

  async $afterRoutesInit() {
    if (this.oidcProvider.hasConfiguration()) {
      const provider = this.oidcProvider.get();

      switch (this.platformName) {
        default:
        case "express":
          this.app.use(this.basePath, provider.callback());
          break;
        case "koa":
          this.app.use(koaMount(this.basePath, provider.app));
          break;
      }
    }
  }

  $onReady() {
    if (this.oidcProvider.hasConfiguration() && "getBestHost" in this.injector.settings) {
      const {injector} = this;
      // @ts-ignore
      const host = injector.settings.getBestHost();
      const url = host.toString();

      injector.logger.info(`WellKnown is available on ${url}/.well-known/openid-configuration`);
    }
  }

  private async getRewriteMiddleware() {
    switch (this.platformName) {
      default:
      case "express":
        const {default: expressUrlRewrite} = await import("express-urlrewrite");
        return expressUrlRewrite("/.well-known/*", `${this.basePath}/.well-known/$1`);
      case "koa":
        // @ts-ignore
        const {default: koaUrlRewrite} = await import("koa-rewrite");
        return koaUrlRewrite("/.well-known/(.*)", `${this.basePath}/.well-known/$1`);
    }
  }
}
