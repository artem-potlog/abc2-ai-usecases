/**
 * Locked teaser dataset for the public preview.
 *
 * SECURITY: this build intentionally ships ONLY high-level catalogue fields
 * (id, business domain, deployment posture, criticality). The actual use-case
 * titles, descriptions, tools, workflows and scenarios are NOT included in this
 * repository or bundle, so there is nothing sensitive to "unlock" client-side.
 */

export interface TeaserCase {
  id: string
  domain: string
  deployment: string
  riskLevel: string
}

export const teaserCases: TeaserCase[] = [
  { id: 'UC-01', domain: 'Strategy', deployment: 'Cloud (Private)', riskLevel: 'Medium' },
  { id: 'UC-02', domain: 'Strategy', deployment: 'On-prem / Private Cloud', riskLevel: 'High' },
  { id: 'UC-03', domain: 'Finance', deployment: 'Private Cloud', riskLevel: 'Low–Med' },
  { id: 'UC-04', domain: 'Corp Dev', deployment: 'Cloud (Isolated)', riskLevel: 'Critical' },
  { id: 'UC-05', domain: 'Comms / Risk', deployment: 'SaaS', riskLevel: 'Low' },
  { id: 'UC-06', domain: 'Corp Sec / Governance', deployment: 'Private VNet', riskLevel: 'Low–Med' },
  { id: 'UC-07', domain: 'Treasury', deployment: 'On-prem SAP', riskLevel: 'Medium' },
  { id: 'UC-08', domain: 'SCM', deployment: 'Cloud', riskLevel: 'High' },
  { id: 'UC-09', domain: 'Corp Dev / GR', deployment: 'Private Cloud', riskLevel: 'Very High' },
]
