import { execSync } from 'child_process';

try {
  console.log('--- GIT RECENT COMMITS ---');
  console.log(execSync('git log -n 12 --oneline').toString());

  console.log('--- GIT DIFF HISTORIES ---');
  // Look for any commits touching BackgroundRemover, FaceSwap, or aiService
  const commits = execSync('git log --all --grep="Gradio" --grep="Face" --grep="Background" --oneline').toString();
  console.log('Relevant Commits:\n', commits);

  // Let's run a diff search for HF Space or Gradio URLs in git, using git log -S
  const diffs = execSync('git log -S "hf.space" --oneline').toString();
  console.log('Commits changing hf.space:\n', diffs);

  // Show status
  console.log('--- CHUNKS SHOWING HF.SPACE ---');
  const filesWithHF = execSync('git log -p -S "hf.space" --limit=3').toString();
  console.log(filesWithHF.substring(0, 4000));
} catch (e: any) {
  console.error('Git error:', e.message, e.stderr?.toString());
}
