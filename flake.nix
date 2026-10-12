{
  description = "Tracking issues and test procedures";

  input.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { nixpkgs }: {
    devShells = {
      x86_64-linux.default = let
        system = "x86_64-linux";
        pkgs = nixpkgs.lib.mkDevShell;
      in {
        buildInputs = [
          nodejs-slim
        ];
      };
    };
  };
}
