import { DraggableNode } from '../draggableNode';
import { useStore } from '../store';
import { WORKFLOW_TEMPLATES } from '../graph/templates';

const groups = [
  {
    title: 'Core',
    items: [
      { type: 'customInput', label: 'Input', hint: 'Start of pipeline', icon: 'IN' },
      { type: 'text', label: 'Text', hint: 'Template / prompt', icon: 'TX' },
      { type: 'llm', label: 'LLM', hint: 'Model step', icon: 'AI' },
      { type: 'customOutput', label: 'Output', hint: 'End of pipeline', icon: 'OUT' },
    ],
  },
  {
    title: 'Utilities',
    items: [
      { type: 'delay', label: 'Delay', hint: 'Wait step', icon: '⏱' },
      { type: 'math', label: 'Math', hint: 'Compute numbers', icon: '∑' },
      { type: 'filter', label: 'Filter', hint: 'Route by condition', icon: '⎇' },
      { type: 'api', label: 'API', hint: 'HTTP request', icon: '⇄' },
      { type: 'image', label: 'Image', hint: 'Image step', icon: 'IMG' },
    ],
  },
];

export function Sidebar() {
  const loadTemplate = useStore((state) => state.loadTemplate);

  return (
    <div className="sidebarScroll">
      <div>
        <div className="sidebarGroupTitle">Templates</div>
        <div className="templateList">
          {WORKFLOW_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`templateCard${t.invalid ? ' templateCardInvalid' : ''}`}
              onClick={() => loadTemplate(t.id)}
            >
              <div className="templateName">{t.name}</div>
              <div className="templateDesc">{t.description}</div>
            </button>
          ))}
        </div>
      </div>

      {groups.map((group) => (
        <div key={group.title}>
          <div className="sidebarGroupTitle">{group.title}</div>
          <div className="nodeCardGrid">
            {group.items.map((item) => (
              <DraggableNode
                key={item.type}
                type={item.type}
                label={item.label}
                hint={item.hint}
                icon={item.icon}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
