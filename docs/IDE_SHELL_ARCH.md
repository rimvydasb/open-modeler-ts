# IDE Shell Architecture

The IDE Shell is the outermost structural layer of the EdgeRules Modeler — the "chrome" that wraps every view. It
defines the two primary layouts (Landing and Project), the hash-based router that switches between them, and the
top-level navigation controls that let users move between projects and between modules within a project.

## Goals

- **Navigation:** Provide a seamless, hash-based SPA routing layer that works on static hosts (S3) without server-side
  redirects.
- **Context Switching:** Clearly separate the multi-project workspace (Landing) from the single-project IDE (Project)
  with distinct layout shells.
- **Module Tabs:** Give each project a persistent toolbar with five module tabs — Editor, Tests, Types, App, Deploy — so
  users can switch contexts without losing their place.
- **Consistency:** Establish a shared TopBar, account menu, and theming across all views.

## Architecture & Routing

The shell is driven by a single `useHashRoute` hook that parses `window.location.hash` and returns a `RouteState`. The
root `page.tsx` reads this state and renders either `LandingLayout` or `ProjectLayout`, injecting the appropriate view
component as children.

### Route Map

| View                     | Hash Pattern                     | Layout        | Module Tab |
|:-------------------------|:---------------------------------|:--------------|:-----------|
| **Landing**              | `/` (no hash)                    | LandingLayout | —          |
| **Health**               | `#health`                        | —             | —          |
| **Flow Editor**          | `#flow/:projectId`               | ProjectLayout | Editor     |
| **Flow Editor (Nested)** | `#flow/:projectId/:key`          | ProjectLayout | Editor     |
| **Visual Editor**        | `#visual-editor/:projectId/:key` | ProjectLayout | Editor     |
| **Code Editor**          | `#code-editor/:projectId/:key`   | ProjectLayout | Editor     |
| **Tests Summary**        | `#tests/:projectId`              | ProjectLayout | Tests      |
| **Test Editor**          | `#tests/:projectId/:key`         | ProjectLayout | Tests      |
| **Types**                | `#types/:projectId`              | ProjectLayout | Types      |
| **App Preview**          | `#app/:projectId`                | ProjectLayout | App        |
| **Deployment**           | `#deploy/:projectId`             | ProjectLayout | Deploy     |

### Route Parameters

- **`:projectId`** — unique project identifier (e.g., `loan-approval-demo`).
- **`:key`** — context key within the project (e.g., a function name like `calculatemonthlypayment`). Defaults to `root`
  when omitted. Case-insensitive, presented as lowercase.
- **Validation:** `projectId` and `key` must be alphanumeric with `-` and `_` allowed.

### Hash Route Hook

```typescript
interface RouteState {
    view: 'landing' | 'health' | 'flow' | 'visual-editor' | 'code-editor' | 'tests' | 'types' | 'app' | 'deploy';
    projectId: string | null;
    key: string | null;
}

function useHashRoute(): RouteState;
```

The hook listens to `hashchange` events and parses the hash into a `RouteState`. Components never read
`window.location.hash` directly — they consume `useHashRoute()`.

## Shell Layouts

### Root Router (`app/page.tsx`)

The root page acts as a layout multiplexer. It reads the `RouteState` and wraps the matched view in the correct layout:

```xml

<Page>
    <!-- When view === 'landing' -->
    <LandingLayout>
        <LandingView/>
    </LandingLayout>

    <!-- When view === 'flow' | 'visual-editor' | 'code-editor' | 'tests' | 'types' | 'app' | 'deploy' -->
    <ProjectLayout projectId=":projectId" activeTab="editor|tests|types|app|deploy">
        <FlowEditorView/>      <!-- or any matched view -->
    </ProjectLayout>

    <!-- When view === 'health' -->
    <HealthView/>              <!-- No layout wrapper -->
</Page>
```

---

## Landing Layout

The Landing Layout is the workspace shell — the entry point where users discover examples, manage projects, and navigate
into individual projects.

### Wireframe

```xml

<LandingLayout>
    <TopBar height="64px" position="fixed">
        <Logo title="EdgeRules Modeler" icon="AutoFixHighIcon"/>
        <!-- No module tabs on Landing -->
        <Spacer flex="1"/>
        <AccountMenu position="right" icon="AccountCircleIcon">
            <MenuItem label="Settings" icon="SettingsIcon"/>
            <MenuItem label="Documentation" icon="MenuBookIcon"/>
            <MenuItem label="About" icon="InfoIcon"/>
            <MenuItem label="GitHub Repository" icon="GitHubIcon"/>
            <Divider/>
            <MenuItem label="Logout" icon="LogoutIcon"/>
        </AccountMenu>
    </TopBar>

    <Body display="flex" paddingTop="64px" height="100vh">
        <Sidebar width="240px" position="fixed" borderRight="1px solid divider">
            <NavList>
                <NavItem label="Public Library" icon="PublicIcon" selected="true"/>
                <NavItem label="My Company Workspace" icon="HomeWorkIcon" disabled="true"/>
                <NavItem label="My Workspace" icon="PortraitIcon"/>
            </NavList>
        </Sidebar>

        <MainContent marginLeft="240px" flex="1" overflow="auto" padding="24px">
            <PageHeader>
                <Typography variant="h5">Public Library</Typography>
                <Typography variant="body2" color="text.secondary">
                    Explore example projects to learn EdgeRules Modeler capabilities.
                </Typography>
            </PageHeader>

            <ProjectsGallery display="grid" gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap="16px">
                <!-- Public Library Card -->
                <ProjectCard variant="outlined">
                    <CardContent>
                        <Typography variant="h6">Loan Approval Demo</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Standard DMN-style loan approval logic.
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button label="Add to Workspace" icon="AddIcon" variant="outlined" size="small"/>
                    </CardActions>
                </ProjectCard>

                <!-- User Workspace Card -->
                <ProjectCard variant="outlined">
                    <CardContent>
                        <Typography variant="h6">My Pricing Model</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Last edited: 2 hours ago
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button label="Open" icon="OpenInNewIcon" variant="contained" size="small"/>
                        <IconButton icon="DeleteIcon" color="error"/>
                    </CardActions>
                </ProjectCard>
            </ProjectsGallery>

            <!-- Floating Action Button for My Workspace view -->
            <Fab position="fixed" bottom="24px" right="24px" icon="AddIcon" label="New Project"
                 visible="when activeSection === 'my-workspace'"/>
        </MainContent>
    </Body>
</LandingLayout>
```

### Landing Layout Functional Requirements

#### 1. Public Library

- **Source:** Example projects preloaded from static JSON files bundled with the app.
- **Action:** "Add to Workspace" copies the example project into the user's IndexedDB storage as a new, editable
  project.
- **Auto-population:** On each application start, the Public Library is populated with predefined example projects:
    1. "Loan Approval Demo" — Standard DMN-style loan approval logic.
    2. "Insurance Quote Engine" — Example of insurance premium calculation.
    3. "E-commerce Discount Rules" — Rules for applying discounts in an online store.

#### 2. My Workspace

- **Source:** User projects stored in browser IndexedDB (Store: `projects`).
- **Display:** Grid of project cards with metadata (Name, Description, Last Modified).
- **Actions:**
    - **Open:** Navigates to `#flow/:projectId` (opens the Flow Editor by default).
    - **Delete:** Removes the project from IndexedDB (with confirmation dialog).
    - **Create New:** Floating action button initializes a blank project with a form dialog.

#### 3. My Company Workspace (Placeholder)

- **Goal:** Future integration for team-based projects (Git or Cloud API).
- **Current State:** Disabled navigation item with tooltip "Coming Soon".

---

## Project Layout

The Project Layout is the IDE shell — the workspace for a single open project. It provides persistent module navigation
via a tabbed toolbar in the TopBar, a project-scoped breadcrumb, and a back-to-workspace action.

### Module Tabs

The project toolbar contains five module tabs. Each tab activates a group of related views within the project:

| Tab        | Icon                | MUI Icon Name      | Default Route        | Description                             |
|:-----------|:--------------------|:-------------------|:---------------------|:----------------------------------------|
| **Editor** | ✏️ Pencil           | `EditIcon`         | `#flow/:projectId`   | Flow canvas, visual editor, code editor |
| **Tests**  | 🧪 Flask            | `ScienceIcon`      | `#tests/:projectId`  | Test suite listing and test case editor |
| **Types**  | 🔷 Geometric shapes | `CategoryIcon`     | `#types/:projectId`  | Custom type library and schemas         |
| **App**    | 👁️ Eye             | `VisibilityIcon`   | `#app/:projectId`    | Interactive preview / workbook GUI      |
| **Deploy** | 🚀 Rocket           | `RocketLaunchIcon` | `#deploy/:projectId` | Deployment configuration and targets    |

**Tab selection logic:** The active tab is determined from the current `RouteState.view`:

| Route View      | Active Tab |
|:----------------|:-----------|
| `flow`          | Editor     |
| `visual-editor` | Editor     |
| `code-editor`   | Editor     |
| `tests`         | Tests      |
| `types`         | Types      |
| `app`           | App        |
| `deploy`        | Deploy     |

### Wireframe

```xml

<ProjectLayout projectId=":projectId" activeTab="editor">
    <TopBar height="64px" position="fixed">
        <BackButton icon="ArrowBackIcon" tooltip="Back to Workspace" navigateTo="/"/>
        <Logo title="EdgeRules" icon="AutoFixHighIcon" compact="true"/>
        <Divider orientation="vertical"/>

        <ProjectName variant="subtitle1" editable="true">
            Loan Approval Demo
        </ProjectName>

        <Spacer flex="1"/>

        <ModuleTabs value="editor" variant="scrollable" centered="false">
            <Tab label="Editor" icon="EditIcon" value="editor"
                 navigateTo="#flow/:projectId"/>
            <Tab label="Tests" icon="ScienceIcon" value="tests"
                 navigateTo="#tests/:projectId"/>
            <Tab label="Types" icon="CategoryIcon" value="types"
                 navigateTo="#types/:projectId"/>
            <Tab label="App" icon="VisibilityIcon" value="app"
                 navigateTo="#app/:projectId"/>
            <Tab label="Deploy" icon="RocketLaunchIcon" value="deploy"
                 navigateTo="#deploy/:projectId" disabled="true"/>
        </ModuleTabs>

        <Spacer flex="1"/>

        <AccountMenu position="right" icon="AccountCircleIcon">
            <MenuItem label="Settings" icon="SettingsIcon"/>
            <MenuItem label="Documentation" icon="MenuBookIcon"/>
            <MenuItem label="About" icon="InfoIcon"/>
            <MenuItem label="GitHub Repository" icon="GitHubIcon"/>
            <Divider/>
            <MenuItem label="Logout" icon="LogoutIcon"/>
        </AccountMenu>
    </TopBar>

    <Body paddingTop="64px" height="100vh" display="flex" flexDirection="column">
        <!-- View-specific toolbar (optional, rendered by child view) -->
        <ViewToolbar height="48px" borderBottom="1px solid divider">
            <!-- Example: Flow Editor toolbar -->
            <Breadcrumb>
                <BreadcrumbItem label="Loan Approval Demo" navigateTo="#flow/:projectId"/>
                <BreadcrumbItem label="calculateMonthlyPayment" active="true"/>
            </Breadcrumb>
            <Spacer flex="1"/>
            <ActionGroup>
                <IconButton icon="PlayArrowIcon" tooltip="Run"/>
                <IconButton icon="SaveIcon" tooltip="Save"/>
                <IconButton icon="MoreVertIcon" tooltip="More Actions"/>
            </ActionGroup>
        </ViewToolbar>

        <!-- Main content area: filled by the active view -->
        <ViewContent flex="1" overflow="auto">
            <!-- Rendered by router: FlowEditorView, TestsManagerView, etc. -->
            {children}
        </ViewContent>
    </Body>
</ProjectLayout>
```

### Project Layout Functional Requirements

#### 1. TopBar Navigation

- **Back Button:** Navigates to the landing page (`/`). Always visible in project context.
- **Logo:** Compact variant showing "EdgeRules" without the full "Modeler" suffix. Clickable — navigates to landing.
- **Project Name:** Displays the current project's name. Inline-editable (click to rename, blur or Enter to save).

#### 2. Module Tabs

- **Behavior:** Clicking a tab navigates to its default route (see table above). The tab highlight persists across
  sub-views (e.g., navigating from `#flow/:projectId` to `#code-editor/:projectId/:key` keeps "Editor" active).
- **Deploy Tab:** Disabled in MVP with a tooltip "Coming Soon". The tab is visible but not clickable.
- **Badge indicators** (post-MVP): Tests tab can show a badge with pass/fail count. Deploy tab can show deployment
  status.

#### 3. View Toolbar

- **Ownership:** Each view renders its own toolbar content into a shared slot. The `ProjectLayout` provides the toolbar
  container; the child view fills it.
- **Breadcrumb:** Shows the navigation path within the Editor tab (project → function/context). Other tabs may use the
  breadcrumb slot for their own context (e.g., Tests → specific test suite).
- **Actions:** View-specific actions (Run, Save, Format, Add Node, etc.) appear on the right side of the toolbar.

#### 4. View Content

- **Full-height:** The view content area fills all remaining vertical space below the toolbar.
- **Scroll:** Each view manages its own scroll behavior (e.g., Flow Editor has pan/zoom, Code Editor has internal
  scroll, Tests Manager has a scrollable list).

---

## Editor Tab — Sub-Views

The Editor tab is the most complex module. It hosts three distinct editing views that share the "Editor" tab highlight:

### Flow Editor (`#flow/:projectId` / `#flow/:projectId/:key`)

The primary visual programming canvas. Uses ReactFlow to display the project's function graph.

```xml

<FlowEditorView>
    <ViewToolbar>
        <Breadcrumb>
            <BreadcrumbItem label=":projectName" navigateTo="#flow/:projectId"/>
            <BreadcrumbItem label=":functionName" active="true" condition="key !== null"/>
        </Breadcrumb>
        <Spacer/>
        <ToggleButtonGroup value="flow" exclusive="true">
            <ToggleButton value="flow" icon="AccountTreeIcon" tooltip="Flow View"/>
            <ToggleButton value="code" icon="CodeIcon" tooltip="Code View"/>
        </ToggleButtonGroup>
        <Divider orientation="vertical"/>
        <IconButton icon="PlayArrowIcon" tooltip="Run Project"/>
    </ViewToolbar>

    <FlowCanvas flex="1">
        <ReactFlowProvider>
            <ReactFlow nodes="{nodes}" edges="{edges}" nodeTypes="{customNodeTypes}">
                <Controls/>
                <MiniMap/>
                <Background/>
            </ReactFlow>
        </ReactFlowProvider>

        <!-- Side panel for node properties (slides in on node selection) -->
        <PropertiesPanel width="320px" position="right" visible="when node selected">
            <NodeProperties node="{selectedNode}"/>
        </PropertiesPanel>
    </FlowCanvas>
</FlowEditorView>
```

### Visual Editor (`#visual-editor/:projectId/:key`)

Advanced context editor for decision tables, lists, and other structured data.

```xml

<VisualEditorView>
    <ViewToolbar>
        <Breadcrumb>
            <BreadcrumbItem label=":projectName" navigateTo="#flow/:projectId"/>
            <BreadcrumbItem label=":contextName" active="true"/>
        </Breadcrumb>
        <Spacer/>
        <IconButton icon="SaveIcon" tooltip="Save Changes"/>
        <IconButton icon="UndoIcon" tooltip="Undo"/>
        <IconButton icon="RedoIcon" tooltip="Redo"/>
    </ViewToolbar>

    <EditorContent flex="1" padding="16px">
        <!-- Rendered based on context type: DecisionTable, ListEditor, etc. -->
        {contextEditor}
    </EditorContent>
</VisualEditorView>
```

### Code Editor (`#code-editor/:projectId/:key`)

Full-featured code editor with TypeScript support.

```xml

<CodeEditorView>
    <ViewToolbar>
        <Breadcrumb>
            <BreadcrumbItem label=":projectName" navigateTo="#flow/:projectId"/>
            <BreadcrumbItem label=":fileName" active="true"/>
        </Breadcrumb>
        <Spacer/>
        <ToggleButtonGroup value="code" exclusive="true">
            <ToggleButton value="flow" icon="AccountTreeIcon" tooltip="Flow View"/>
            <ToggleButton value="code" icon="CodeIcon" tooltip="Code View"/>
        </ToggleButtonGroup>
        <Divider orientation="vertical"/>
        <IconButton icon="FormatAlignLeftIcon" tooltip="Format"/>
        <IconButton icon="SaveIcon" tooltip="Save"/>
    </ViewToolbar>

    <EditorContent flex="1">
        <AceEditor language="typescript" theme="monokai" value="{sourceCode}"/>
    </EditorContent>
</CodeEditorView>
```

---

## Tests Tab (`#tests/:projectId` / `#tests/:projectId/:key`)

```xml

<TestsManagerView>
    <ViewToolbar>
        <Breadcrumb>
            <BreadcrumbItem label="All Tests" navigateTo="#tests/:projectId"/>
            <BreadcrumbItem label=":testSuiteName" active="true" condition="key !== null"/>
        </Breadcrumb>
        <Spacer/>
        <Button label="Run All" icon="PlayArrowIcon" variant="contained" size="small"/>
        <IconButton icon="AddIcon" tooltip="Add Test Case"/>
    </ViewToolbar>

    <!-- Summary View (no :key) -->
    <TestsSummary condition="key === null">
        <TestSuiteList>
            <TestSuiteRow name="calculateMonthlyPayment" passed="3" failed="1" total="4"
                          navigateTo="#tests/:projectId/calculatemonthlypayment"/>
            <TestSuiteRow name="evaluateLoanRisk" passed="2" failed="0" total="2"
                          navigateTo="#tests/:projectId/evaluateloanrisk"/>
        </TestSuiteList>
    </TestsSummary>

    <!-- Detail View (with :key) -->
    <TestCaseEditor condition="key !== null" flex="1">
        <SplitPane direction="horizontal" defaultSplit="60%">
            <LeftPane>
                <TestCaseForm>
                    <InputSection label="Inputs">
                        <JsonEditor value="{testInputs}"/>
                    </InputSection>
                    <ExpectedSection label="Expected Output">
                        <JsonEditor value="{expectedOutput}"/>
                    </ExpectedSection>
                </TestCaseForm>
            </LeftPane>
            <RightPane>
                <TestResultsPanel>
                    <ResultHeader status="pass|fail|pending"/>
                    <ActualOutput value="{actualOutput}"/>
                    <DiffView expected="{expected}" actual="{actual}"/>
                </TestResultsPanel>
            </RightPane>
        </SplitPane>
    </TestCaseEditor>
</TestsManagerView>
```

---

## Types Tab (`#types/:projectId`)

```xml

<TypesEditorView>
    <ViewToolbar>
        <Typography variant="subtitle2">Type Library</Typography>
        <Spacer/>
        <Button label="Add Type" icon="AddIcon" variant="outlined" size="small"/>
        <IconButton icon="RefreshIcon" tooltip="Re-extract from Source"/>
    </ViewToolbar>

    <TypesContent flex="1" display="flex">
        <TypesList width="280px" borderRight="1px solid divider" overflow="auto">
            <ListItem label="LoanApplication" icon="DataObjectIcon" selected="true"/>
            <ListItem label="RiskAssessment" icon="DataObjectIcon"/>
            <ListItem label="PaymentSchedule" icon="DataObjectIcon"/>
            <Divider/>
            <ListSubheader label="Enums"/>
            <ListItem label="RiskLevel" icon="ListIcon"/>
        </TypesList>

        <TypeForm flex="1" padding="16px">
            <TextField label="Type Name" value="LoanApplication" fullWidth="true"/>
            <FieldsEditor>
                <FieldRow name="applicantName" type="string" required="true"/>
                <FieldRow name="loanAmount" type="number" required="true"/>
                <FieldRow name="creditScore" type="number" required="false"/>
                <FieldRow name="riskLevel" type="RiskLevel" required="false"/>
            </FieldsEditor>
            <CodePreview language="typescript" readOnly="true">
                <!-- Auto-generated TypeScript interface preview -->
            </CodePreview>
        </TypeForm>
    </TypesContent>
</TypesEditorView>
```

---

## App Tab (`#app/:projectId`)

The App Preview is the interactive "workbook" — a live execution environment that renders hook output (charts, tables,
logs) and allows users to interact with their business logic.

```xml

<AppPreviewView>
    <ViewToolbar>
        <Typography variant="subtitle2">App Preview</Typography>
        <Spacer/>
        <Button label="Run" icon="PlayArrowIcon" variant="contained" size="small" color="success"/>
        <IconButton icon="StopIcon" tooltip="Stop Execution"/>
        <Divider orientation="vertical"/>
        <IconButton icon="DeleteSweepIcon" tooltip="Clear Output"/>
    </ViewToolbar>

    <PreviewContent flex="1" display="flex" flexDirection="column">
        <!-- Input Panel: user provides execution inputs -->
        <InputPanel height="auto" padding="16px" borderBottom="1px solid divider">
            <Typography variant="subtitle2">Inputs</Typography>
            <DynamicForm fields="{astSignatures.parameters}">
                <!-- Auto-generated form fields from AST parameter signatures -->
                <TextField label="principal" type="number"/>
                <TextField label="annualRate" type="number"/>
                <TextField label="months" type="number"/>
            </DynamicForm>
        </InputPanel>

        <!-- Output Panels: rendered from hook callbacks -->
        <OutputArea flex="1" overflow="auto" padding="16px">
            <ChartPanel condition="chartHookCalled">
                <!-- MUI X Charts rendered from chart() hook data -->
                <BarChart data="{chartData}"/>
            </ChartPanel>

            <TablePanel condition="tableHookCalled">
                <!-- DataGrid rendered from table() hook data -->
                <DataGrid rows="{tableRows}" columns="{tableColumns}"/>
            </TablePanel>

            <ConsolePanel minHeight="200px" position="bottom">
                <!-- log() hook output displayed as terminal-style console -->
                <ConsoleLine level="info" timestamp="12:34:56">Calculation complete.</ConsoleLine>
                <ConsoleLine level="warn" timestamp="12:34:57">Rate is unusually high.</ConsoleLine>
            </ConsolePanel>
        </OutputArea>
    </PreviewContent>
</AppPreviewView>
```

---

## Deploy Tab (`#deploy/:projectId`)

> 🚫 **OUT OF SCOPE for MVP.** The Deploy tab is visible but disabled in the project toolbar. The wireframe below
> represents the post-MVP target design.

```xml

<DeployManagerView>
    <ViewToolbar>
        <Typography variant="subtitle2">Deployment</Typography>
        <Spacer/>
        <Button label="Add Target" icon="AddIcon" variant="outlined" size="small"/>
    </ViewToolbar>

    <DeployContent flex="1" display="flex">
        <TargetsList width="280px" borderRight="1px solid divider">
            <ListItem label="Production (Vercel)" icon="CloudIcon" selected="true"/>
            <ListItem label="Staging (AWS Lambda)" icon="CloudQueueIcon"/>
        </TargetsList>

        <TargetConfig flex="1" padding="16px">
            <Typography variant="h6">Production (Vercel)</Typography>

            <Section label="Environment Variables">
                <EnvironmentEditor>
                    <EnvRow key="API_KEY" value="••••••••" secret="true"/>
                    <EnvRow key="MODEL_ENDPOINT" value="https://api.example.com/v1"/>
                    <Button label="Add Variable" icon="AddIcon" size="small"/>
                </EnvironmentEditor>
            </Section>

            <Section label="Deployment History">
                <DeploymentRow version="v1.2.3" status="live" timestamp="2 hours ago"/>
                <DeploymentRow version="v1.2.2" status="archived" timestamp="3 days ago"/>
            </Section>

            <ActionBar>
                <Button label="Deploy" icon="RocketLaunchIcon" variant="contained" color="primary"/>
            </ActionBar>
        </TargetConfig>
    </DeployContent>
</DeployManagerView>
```

---

## Shared Components

### TopBar

The TopBar is consistent across both layouts but adapts its content:

| Element      | Landing Layout             | Project Layout                             |
|:-------------|:---------------------------|:-------------------------------------------|
| Back Button  | Hidden                     | Visible (→ landing)                        |
| Logo         | Full ("EdgeRules Modeler") | Compact ("EdgeRules")                      |
| Project Name | Hidden                     | Visible, inline-editable                   |
| Module Tabs  | Hidden                     | 5 tabs (Editor, Tests, Types, App, Deploy) |
| Account Menu | Visible                    | Visible                                    |

### Account Menu

Shared dropdown menu rendered in both layouts:

- **Settings** — Application preferences (theme, editor settings).
- **Documentation** — Opens external docs in new tab.
- **About** — Version info dialog.
- **GitHub Repository** — Opens repo in new tab.
- **Logout** — Clears session (placeholder for future auth).

### Snackbar Notifications

Global notification system using `notistack`. All views can trigger notifications via `useNotification()` hook:

- **Success:** "Project saved", "Test passed", "Added to workspace".
- **Error:** "Failed to save", "Execution error", "Invalid input".
- **Info:** "Project imported", "Type extracted".

---

## UI/UX Implementation Details

- **Framework:** React 19 with Material UI v7 (`@mui/material`).
- **Icons:** `@mui/icons-material` for all icon references in wireframes.
- **Tabs:** MUI `Tabs` component with `icon` and `label` props. `iconPosition="start"` for horizontal icon+label.
- **Layout:** CSS Flexbox via MUI `Box` and `sx` prop. No CSS Grid except for the project gallery.
- **Scroll:** TopBar and sidebar are `position: fixed`. View content manages its own scrolling.
- **Responsive:** Not a primary concern for MVP (desktop-first IDE). Minimum supported width: 1024px.
- **Storage:**
    - **User Projects:** IndexedDB → `EdgeRulesWorkbook` → `projects` store.
    - **Examples:** Static assets loaded via `fetch` or imported JSON.

## Component File Mapping

| Component           | File Path                                                     |
|:--------------------|:--------------------------------------------------------------|
| Hash Route Hook     | `src/hooks/use-hash-route.ts`                                 |
| Root Router         | `src/app/page.tsx`                                            |
| Landing Layout      | `src/components/layouts/landing-layout.tsx`                   |
| Project Layout      | `src/components/layouts/project-layout.tsx`                   |
| Landing View        | `src/components/views/landing/landing-view.tsx`               |
| Flow Editor View    | `src/components/views/flow-editor/flow-editor-view.tsx`       |
| Visual Editor View  | `src/components/views/visual-editor/visual-editor-view.tsx`   |
| Code Editor View    | `src/components/views/code-editor/code-editor-view.tsx`       |
| Tests Manager View  | `src/components/views/tests-manager/tests-manager-view.tsx`   |
| Types Editor View   | `src/components/views/types-editor/types-editor-view.tsx`     |
| App Preview View    | `src/components/views/app-preview/app-preview-view.tsx`       |
| Deploy Manager View | `src/components/views/deploy-manager/deploy-manager-view.tsx` |
| Account Menu        | `src/components/common/account-menu.tsx`                      |
| Confirm Dialog      | `src/components/common/dialogs/confirm-dialog.tsx`            |
| Form Dialog         | `src/components/common/dialogs/form-dialog.tsx`               |
| Snackbar Provider   | `src/components/common/snackbar/snackbar-provider.tsx`        |

## Open Questions

- **Sidebar Collapse:** Should the landing sidebar be collapsible on smaller screens? (Nice to have for post-MVP).
- **Tab Persistence:** When switching between module tabs, should the previously viewed sub-route be remembered? (e.g.,
  returning to Editor tab re-opens `#code-editor/:projectId/:key` instead of resetting to `#flow/:projectId`).
  Recommended: Yes, store last route per tab in session state.
- **Keyboard Shortcuts:** Should module tabs be accessible via keyboard shortcuts (e.g., `Cmd+1` for Editor, `Cmd+2` for
  Tests)? (Recommended for post-MVP).

## Next Steps

- [ ] Implement `useHashRoute` hook with `hashchange` listener and route parsing.
- [ ] Implement `LandingLayout` component with TopBar, Sidebar, and content area.
- [ ] Implement `ProjectLayout` component with TopBar, Module Tabs, and view toolbar slot.
- [ ] Refactor `app/page.tsx` to act as hash-based router multiplexer.
- [ ] Create placeholder view components for all routes (stub content).
- [ ] Implement Account Menu as shared component.
- [ ] Integrate IndexedDB access for project listing on Landing view.
- [ ] Load example projects into the Public Library section.
- [ ] Cypress tests: navigate between landing and project layouts, verify tab switching.
- [ ] Review and validate against ARCHITECTURE.md route map.