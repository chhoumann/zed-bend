use std::fs;

use zed_extension_api::{self as zed, settings::LspSettings, LanguageServerId, Result};

struct BendExtension;

impl BendExtension {
    fn bolt_command(
        &self,
        language_server_id: &LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<zed::Command> {
        let settings = LspSettings::for_worktree(language_server_id.as_ref(), worktree).ok();
        let binary = settings.and_then(|settings| settings.binary);
        let args = binary
            .as_ref()
            .and_then(|binary| binary.arguments.clone())
            .unwrap_or_else(|| vec!["lsp".into()]);
        let env = server_env(worktree);

        if let Some(path) = binary.and_then(|binary| binary.path) {
            return Ok(zed::Command {
                command: path,
                args,
                env,
            });
        }

        if let Some(path) = find_bolt(worktree, &env) {
            return Ok(zed::Command {
                command: path,
                args,
                env,
            });
        }

        Err(
            "bolt was not found. Install it (`nix profile install github:Emerging-Patterns/bolt`, or `bend bolt/main.bend -o bin/bolt.bin`), put `bolt` on PATH, or set lsp.bolt.binary.path."
                .into(),
        )
    }
}

fn server_env(worktree: &zed::Worktree) -> Vec<(String, String)> {
    let mut env = worktree.shell_env();
    let home = env
        .iter()
        .find(|(key, _)| key == "HOME")
        .map(|(_, value)| value.clone());
    if let Some(home) = home {
        let extra = extra_bin_dirs(&home).join(":");
        if let Some((_, path)) = env.iter_mut().find(|(key, _)| key == "PATH") {
            *path = format!("{extra}:{path}");
        } else {
            env.push(("PATH".into(), extra));
        }
    }
    env
}

fn extra_bin_dirs(home: &str) -> Vec<String> {
    [".local/bin", ".bend/bin", ".bun/bin", ".nix-profile/bin"]
        .iter()
        .map(|dir| format!("{home}/{dir}"))
        .collect()
}

fn find_bolt(worktree: &zed::Worktree, env: &[(String, String)]) -> Option<String> {
    if let Some(path) = worktree.which("bolt") {
        return Some(path);
    }
    if let Some(path) = worktree.which("bolt.bin") {
        return Some(path);
    }

    let home = env
        .iter()
        .find(|(key, _)| key == "HOME")
        .map(|(_, value)| value.as_str());
    if let Some(home) = home {
        for dir in extra_bin_dirs(home) {
            let path = format!("{dir}/bolt");
            if runnable(&path) {
                return Some(path);
            }
        }
    }

    let checkout = format!("{}/bin/bolt.bin", worktree.root_path());
    if runnable(&checkout) {
        return Some(checkout);
    }

    None
}

fn runnable(path: &str) -> bool {
    fs::metadata(path).is_ok_and(|stat| stat.is_file())
}

impl zed::Extension for BendExtension {
    fn new() -> Self {
        Self
    }

    fn language_server_command(
        &mut self,
        language_server_id: &LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<zed::Command> {
        self.bolt_command(language_server_id, worktree)
    }

    fn language_server_initialization_options(
        &mut self,
        language_server_id: &LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<Option<zed::serde_json::Value>> {
        Ok(
            LspSettings::for_worktree(language_server_id.as_ref(), worktree)
                .ok()
                .and_then(|settings| settings.initialization_options),
        )
    }

    fn language_server_workspace_configuration(
        &mut self,
        language_server_id: &LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<Option<zed::serde_json::Value>> {
        Ok(
            LspSettings::for_worktree(language_server_id.as_ref(), worktree)
                .ok()
                .and_then(|settings| settings.settings),
        )
    }
}

zed::register_extension!(BendExtension);
