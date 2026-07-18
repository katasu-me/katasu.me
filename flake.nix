{
  description = "katasu.me dev shell";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { nixpkgs, ... }:
    let
      forAllSystems = nixpkgs.lib.genAttrs [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          # Node/pnpm などのツールチェーンは mise で管理しているため、ここでは扱わない。
          # workerd（プレビルドバイナリ）が NixOS 上で CA ストアを見つけられず、
          # dev 時の外部への fetch が TLS 検証エラーになるのを防ぐため、
          # SSL_CERT_FILE を設定する。
          # cacert の setup hook 経由だと nix develop が SSL_CERT_FILE を
          # 除外してしまうので、shellHook で明示的に export する。
          default = pkgs.mkShell {
            packages = [
              # ツールチェーン（ローカル・CI共通）
              # pnpmはpackage.jsonのpackageManagerに書かれた正確なバージョンを
              # 自身で解決して実行するため、nixpkgs側はメジャーバージョンの固定だけでよい
              pkgs.nodejs
              pkgs.pnpm_11
              pkgs.bun

              # 開発用証明書（certificates/）の生成に使用
              # nssToolsは mkcert -install がブラウザ（NSS）にルートCAを登録するのに必要
              pkgs.mkcert
              pkgs.nssTools
            ];

            shellHook = ''
              export SSL_CERT_FILE=${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt
              export NIX_SSL_CERT_FILE=$SSL_CERT_FILE
            '';
          };
        }
      );
    };
}
