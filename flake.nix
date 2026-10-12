{
  description = "Tracking issues and test procedures";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }: let
    systems = [
      "x86_64-linux"
      "aarch64-linux"
      "x86_64-darwin"
      "aarch64-darwin"
    ];
    forAllSystems = nixpkgs.lib.genAttrs systems;

    mkPackage = system: let
      pkgs = import nixpkgs { inherit system; };
      nodejs = pkgs.nodejs;
    in
      pkgs.buildNpmPackage {
      pname = "Issue cards";
      version = "1.4.0";
      src = self;
      inherit nodejs;

      npmDepsHash = "sha256-kkQNjzGdiTmujwfXkI134piz/RUxwZHzhYpZYXyfsoU";
      npmBuildScript = "build:nix";

      installPhase = ''
      '';

      meta = {
        description = "Tracking issues and test procedures";
        mainProgram = "issue-cards";
        platforms = systems;
      };
    };
  in {
    packages = forAllSystems (system: {
      default = mkPackage system;
      issue-cards = mkPackage system;
  });

  overlays.default = final: prev: {
    issue-cards = self.packages.${final.stdev.hostPlatform.system}.default;
  };
 };
}
