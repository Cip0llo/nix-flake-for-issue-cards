{
  description = "Tracking issues and test procedures";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }: {
    packages.x86_64-linux = {
      default = let
        pkg = nixpkgs.legacyPackages.x86_64-linux.buildNpmPackage {
          p = "Issue Cards";
          buildInputs = [ nodejs-slim ];
        };
      in pkg;
    };
  };

  devShells = {
    x86_64-linux.default = let
      system = "x86_64-linux";
    in {
        buildInputs = [ nixpkgs.legacyPackages.${system}.nodejs ];
      };
    };
  };
}
