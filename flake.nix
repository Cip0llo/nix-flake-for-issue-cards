{
  description = "Tracking issues and test procedures";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";

  outputs = { self, nixpkgs }: {
    devShells = {
      x86_64-linux.default = let
        system = "x86_64-linux";
      in {
        buildInputs = [
          nixpkgs.nodejs
        ];
      };
    };
  };
}
