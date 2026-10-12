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
        src = self.outPath;
        inherit nodejs;

        npmDepsHash = "sha256-kkQNjzGdiTmujwfXkI134piz/RUxwZHzhYpZYXyfsoU";
        npmBuildScript = "build:nix";

        ELECTRON_SKIP_BINARY_DOWNLOAD = "1";
        buildInputs = [ pkgs.electron ];

        installPhase = ''
          npm build

          mkdir -p $out/share/applications
          mkdir -p $out/share/applications/icon
          install -Dm644 assets/icon.svg $out/share/applications/icon/issue-cards.svg

          cat > $out/share/applications/issue-cards.desktop <<EOF
          [Desktop Entry]
          Type=Application
          Name=Issue Cards
          Comment=Tracking issues and test procedures
          Exec=$out/'Issue Cards.exe'
          Icon=./icon/issue-cards.svg
          Terminal=false
          EOF
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
    issue-cards = self.packages.${final.stdenv.hostPlatform.system}.default;
  };
 };
}
