import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Version API
 * Returns current app version for update checking
 *
 * The version is based on package.json version + build time hash
 * This ensures each deployment has a unique version identifier
 */
export async function GET() {
  try {
    // Read package.json version
    const packageJsonPath = join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    const version = packageJson.version

    // You can also add build timestamp or git commit hash for more precise versioning
    const buildTime = process.env.BUILD_TIME || Date.now().toString()

    return NextResponse.json({
      version,
      buildTime,
      // Combine them for a unique identifier
      hash: `${version}-${buildTime}`,
    })
  } catch (error) {
    console.error('Error reading version:', error)
    return NextResponse.json(
      { error: 'Failed to read version' },
      { status: 500 }
    )
  }
}
