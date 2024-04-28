import { PowerPiApi } from "@powerpi/common-api";
import {
    RenderHookOptions,
    RenderOptions,
    render as testRender,
    renderHook as testRenderHook,
} from "@testing-library/react";
import { PropsWithChildren, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { instance, mock } from "ts-mockito";
import { PowerPiAPIContextProvider } from "./hooks/api";

type CommonProps = {
    api?: PowerPiApi;
    queryClient?: QueryClient;
};

/** Extract our options from those used by `render`/`renderHook` and initialise those that aren't set. */
function setupOptions<TOptionType extends CommonProps>(options: TOptionType) {
    let { api, queryClient, ...defaultOptions } = options;

    api ??= instance(mock<PowerPiApi>());
    queryClient ??= new QueryClient();

    defaultOptions = {
        ...defaultOptions,
        wrapper: ({ children }: PropsWithChildren<unknown>) => (
            <Wrapper api={api} queryClient={queryClient}>
                {children}
            </Wrapper>
        ),
    };

    return defaultOptions;
}

/** Wrap `render` method to setup the API and `react-query`. */
function render(component: ReactNode, options: RenderOptions & CommonProps) {
    const defaultOptions = setupOptions(options);

    return testRender(component, defaultOptions);
}

/** Wrap `renderHook` method to setup the API and `react-query`. */
function renderHook<TResultType>(
    render: Parameters<typeof testRenderHook>[0],
    options: RenderHookOptions<TResultType> & CommonProps,
) {
    const defaultOptions = setupOptions(options);

    return testRenderHook(render, defaultOptions);
}

type WrapperProps = PropsWithChildren<Required<CommonProps>>;

/** The `Wrapper` component simply wraps the component/hook under test with the API and `react-query` providers. */
const Wrapper = ({ api, queryClient, children }: WrapperProps) => (
    <QueryClientProvider client={queryClient}>
        <PowerPiAPIContextProvider api={api}>{children}</PowerPiAPIContextProvider>
    </QueryClientProvider>
);

export * from "@testing-library/react";
export { render, renderHook };
