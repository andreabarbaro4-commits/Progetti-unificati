import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { FormField } from '../../../components/ui/FormField'
import { LocaleSwitcher } from '../../../components/ui/LocaleSwitcher'
import { Card } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { Toggle } from '../../../components/ui/Toggle'

function ComponentSection({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 text-xl font-bold text-gray-900">{name}</h2>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </section>
  )
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-gray-500">{label}</span>
      {children}
    </div>
  )
}

export default function Playground() {
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({
    'default-checked': true,
    'default-unchecked': false,
    'sm-checked': true,
    'sm-unchecked': false,
  })

  function handleToggle(key: string) {
    setToggleStates((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="mb-8 text-3xl font-bold">Component Playground</h1>

      {/* Button: variants (primary, secondary, ghost) × sizes (default, sm, lg) */}
      <ComponentSection name="Button">
        <Labeled label="primary / default">
          <Button variant="primary" size="default">Click</Button>
        </Labeled>
        <Labeled label="primary / sm">
          <Button variant="primary" size="sm">Click</Button>
        </Labeled>
        <Labeled label="primary / lg">
          <Button variant="primary" size="lg">Click</Button>
        </Labeled>
        <Labeled label="secondary / default">
          <Button variant="secondary" size="default">Click</Button>
        </Labeled>
        <Labeled label="secondary / sm">
          <Button variant="secondary" size="sm">Click</Button>
        </Labeled>
        <Labeled label="secondary / lg">
          <Button variant="secondary" size="lg">Click</Button>
        </Labeled>
        <Labeled label="ghost / default">
          <Button variant="ghost" size="default">Click</Button>
        </Labeled>
        <Labeled label="ghost / sm">
          <Button variant="ghost" size="sm">Click</Button>
        </Labeled>
        <Labeled label="ghost / lg">
          <Button variant="ghost" size="lg">Click</Button>
        </Labeled>
      </ComponentSection>

      {/* Card: variants (default, header, wide) × sizes (default, sm) */}
      <ComponentSection name="Card">
        <Labeled label="default / default">
          <Card variant="default" size="default">Card content</Card>
        </Labeled>
        <Labeled label="default / sm">
          <Card variant="default" size="sm">Card content</Card>
        </Labeled>
        <Labeled label="header / default">
          <Card variant="header" size="default">Card content</Card>
        </Labeled>
        <Labeled label="header / sm">
          <Card variant="header" size="sm">Card content</Card>
        </Labeled>
        <Labeled label="wide / default">
          <Card variant="wide" size="default">Card content</Card>
        </Labeled>
        <Labeled label="wide / sm">
          <Card variant="wide" size="sm">Card content</Card>
        </Labeled>
      </ComponentSection>

      {/* Badge: variants (default, active) × sizes (default, sm) */}
      <ComponentSection name="Badge">
        <Labeled label="default / default">
          <Badge variant="default" size="default">Tag</Badge>
        </Labeled>
        <Labeled label="default / sm">
          <Badge variant="default" size="sm">Tag</Badge>
        </Labeled>
        <Labeled label="active / default">
          <Badge variant="active" size="default">Tag</Badge>
        </Labeled>
        <Labeled label="active / sm">
          <Badge variant="active" size="sm">Tag</Badge>
        </Labeled>
      </ComponentSection>

      {/* Toggle: sizes (default, sm) × states (checked, unchecked) */}
      <ComponentSection name="Toggle">
        <Labeled label="default / checked">
          <Toggle
            size="default"
            checked={toggleStates['default-checked']}
            onChange={() => handleToggle('default-checked')}
          />
        </Labeled>
        <Labeled label="default / unchecked">
          <Toggle
            size="default"
            checked={toggleStates['default-unchecked']}
            onChange={() => handleToggle('default-unchecked')}
          />
        </Labeled>
        <Labeled label="sm / checked">
          <Toggle
            size="sm"
            checked={toggleStates['sm-checked']}
            onChange={() => handleToggle('sm-checked')}
          />
        </Labeled>
        <Labeled label="sm / unchecked">
          <Toggle
            size="sm"
            checked={toggleStates['sm-unchecked']}
            onChange={() => handleToggle('sm-unchecked')}
          />
        </Labeled>
      </ComponentSection>

      {/* FormField: with and without error state */}
      <ComponentSection name="FormField">
        <Labeled label="without error">
          <FormField name="demo-name" label="onboarding.nameLabel">
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              id="demo-name"
              placeholder="John Doe"
              type="text"
            />
          </FormField>
        </Labeled>
        <Labeled label="with error">
          <FormField name="demo-email" label="onboarding.emailLabel" error="onboarding.emailError">
            <input
              className="w-full rounded-lg border border-red-400 px-3 py-2 text-sm"
              id="demo-email"
              placeholder="invalid@"
              type="email"
            />
          </FormField>
        </Labeled>
      </ComponentSection>

      {/* LocaleSwitcher: default rendering */}
      <ComponentSection name="LocaleSwitcher">
        <Labeled label="default">
          <LocaleSwitcher />
        </Labeled>
      </ComponentSection>
    </div>
  )
}
